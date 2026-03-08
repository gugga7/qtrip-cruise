import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '../lib/supabase';

export type RsvpStatus = 'pending' | 'confirmed' | 'declined';
export type GroupRole = 'organizer' | 'member';
export type GroupStatus = 'planning' | 'quoted' | 'confirmed' | 'completed' | 'cancelled';

export interface GroupMember {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: GroupRole;
  rsvpStatus: RsvpStatus;
  dietaryRestrictions?: string;
  arrivalInfo?: string;
  notes?: string;
}

export interface TripGroup {
  id: string;
  name: string;
  inviteCode: string;
  organizerId: string;
  destinationId?: string;
  startDate?: string;
  endDate?: string;
  status: GroupStatus;
  members: GroupMember[];
  createdAt: string;
}

interface GroupState {
  activeGroup: TripGroup | null;
  loading: boolean;
  error: string | null;
  setActiveGroup: (group: TripGroup | null) => void;
  createGroup: (name: string, organizerName: string, organizerId: string) => Promise<TripGroup>;
  addMember: (member: Omit<GroupMember, 'id' | 'role' | 'rsvpStatus'>) => Promise<void>;
  removeMember: (memberId: string) => Promise<void>;
  updateMember: (memberId: string, updates: Partial<GroupMember>) => void;
  updateRsvp: (memberId: string, status: RsvpStatus) => Promise<void>;
  updateGroupStatus: (status: GroupStatus) => Promise<void>;
  loadGroup: (inviteCode: string) => Promise<TripGroup | null>;
  loadUserGroup: (userId: string) => Promise<TripGroup | null>;
  getMemberCount: () => number;
  getConfirmedCount: () => number;
  clearGroup: () => void;
}

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// ---------------------------------------------------------------------------
// DB row → local model mappers
// ---------------------------------------------------------------------------

interface DbGroupRow {
  id: string;
  name: string;
  invite_code: string;
  organizer_id: string;
  destination_id: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  trip_data: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

interface DbMemberRow {
  id: string;
  group_id: string;
  user_id: string | null;
  name: string;
  email: string | null;
  phone: string | null;
  role: string;
  rsvp_status: string;
  dietary_restrictions: string | null;
  arrival_info: string | null;
  notes: string | null;
}

function mapMemberRow(row: DbMemberRow): GroupMember {
  return {
    id: row.id,
    name: row.name,
    email: row.email ?? undefined,
    phone: row.phone ?? undefined,
    role: row.role as GroupRole,
    rsvpStatus: row.rsvp_status as RsvpStatus,
    dietaryRestrictions: row.dietary_restrictions ?? undefined,
    arrivalInfo: row.arrival_info ?? undefined,
    notes: row.notes ?? undefined,
  };
}

function mapGroupRow(row: DbGroupRow, memberRows: DbMemberRow[]): TripGroup {
  return {
    id: row.id,
    name: row.name,
    inviteCode: row.invite_code,
    organizerId: row.organizer_id,
    destinationId: row.destination_id ?? undefined,
    startDate: row.start_date ?? undefined,
    endDate: row.end_date ?? undefined,
    status: row.status as GroupStatus,
    members: memberRows.map(mapMemberRow),
    createdAt: row.created_at,
  };
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useGroupStore = create<GroupState>()(
  persist(
    (set, get) => ({
      activeGroup: null,
      loading: false,
      error: null,

      setActiveGroup: (group) => set({ activeGroup: group }),

      // ------------------------------------------------------------------
      // createGroup
      // ------------------------------------------------------------------
      createGroup: async (name, organizerName, organizerId) => {
        const inviteCode = generateInviteCode();
        const now = new Date().toISOString();

        // Insert the group row
        const { data: groupRow, error: groupErr } = await supabase
          .from('trip_groups')
          .insert({
            name,
            organizer_id: organizerId,
            invite_code: inviteCode,
            status: 'planning',
            trip_data: {},
          })
          .select()
          .single();

        if (groupErr || !groupRow) {
          const msg = groupErr?.message ?? 'Failed to create group';
          console.error('[groupStore] createGroup error:', msg);
          set({ error: msg });
          throw new Error(msg);
        }

        // Insert the organizer as first member
        const { data: memberRow, error: memberErr } = await supabase
          .from('group_members')
          .insert({
            group_id: groupRow.id,
            user_id: organizerId,
            name: organizerName,
            role: 'organizer',
            rsvp_status: 'confirmed',
          })
          .select()
          .single();

        if (memberErr || !memberRow) {
          const msg = memberErr?.message ?? 'Failed to add organizer member';
          console.error('[groupStore] createGroup member error:', msg);
          set({ error: msg });
          throw new Error(msg);
        }

        const group: TripGroup = mapGroupRow(groupRow as unknown as DbGroupRow, [
          memberRow as unknown as DbMemberRow,
        ]);

        set({ activeGroup: group, error: null });
        return group;
      },

      // ------------------------------------------------------------------
      // addMember
      // ------------------------------------------------------------------
      addMember: async (member) => {
        const { activeGroup } = get();
        if (!activeGroup) return;

        // Optimistic update
        const optimisticId = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 12);
        const newMember: GroupMember = {
          ...member,
          id: optimisticId,
          role: 'member',
          rsvpStatus: 'pending',
        };
        const prevGroup = activeGroup;
        set({
          activeGroup: {
            ...activeGroup,
            members: [...activeGroup.members, newMember],
          },
        });

        const { data: row, error } = await supabase
          .from('group_members')
          .insert({
            group_id: activeGroup.id,
            name: member.name,
            email: member.email ?? null,
            phone: member.phone ?? null,
            role: 'member',
            rsvp_status: 'pending',
            dietary_restrictions: member.dietaryRestrictions ?? null,
            arrival_info: member.arrivalInfo ?? null,
            notes: member.notes ?? null,
          })
          .select()
          .single();

        if (error || !row) {
          console.error('[groupStore] addMember error:', error?.message);
          set({ activeGroup: prevGroup, error: error?.message ?? 'Failed to add member' });
          return;
        }

        // Replace optimistic member with real DB row (gets the real id)
        const realMember = mapMemberRow(row as unknown as DbMemberRow);
        set((state) => {
          if (!state.activeGroup) return state;
          return {
            activeGroup: {
              ...state.activeGroup,
              members: state.activeGroup.members.map((m) =>
                m.id === optimisticId ? realMember : m
              ),
            },
            error: null,
          };
        });
      },

      // ------------------------------------------------------------------
      // removeMember
      // ------------------------------------------------------------------
      removeMember: async (memberId) => {
        const { activeGroup } = get();
        if (!activeGroup) return;

        const prevGroup = activeGroup;
        // Optimistic
        set({
          activeGroup: {
            ...activeGroup,
            members: activeGroup.members.filter((m) => m.id !== memberId),
          },
        });

        const { error } = await supabase
          .from('group_members')
          .delete()
          .eq('id', memberId);

        if (error) {
          console.error('[groupStore] removeMember error:', error.message);
          set({ activeGroup: prevGroup, error: error.message });
        } else {
          set({ error: null });
        }
      },

      // ------------------------------------------------------------------
      // updateMember (local only — kept for inline edits that don't need sync)
      // ------------------------------------------------------------------
      updateMember: (memberId, updates) =>
        set((state) => {
          if (!state.activeGroup) return state;
          return {
            activeGroup: {
              ...state.activeGroup,
              members: state.activeGroup.members.map((m) =>
                m.id === memberId ? { ...m, ...updates } : m
              ),
            },
          };
        }),

      // ------------------------------------------------------------------
      // updateRsvp
      // ------------------------------------------------------------------
      updateRsvp: async (memberId, status) => {
        const { activeGroup } = get();
        if (!activeGroup) return;

        const prevGroup = activeGroup;
        // Optimistic
        set({
          activeGroup: {
            ...activeGroup,
            members: activeGroup.members.map((m) =>
              m.id === memberId ? { ...m, rsvpStatus: status } : m
            ),
          },
        });

        const { error } = await supabase
          .from('group_members')
          .update({ rsvp_status: status })
          .eq('id', memberId);

        if (error) {
          console.error('[groupStore] updateRsvp error:', error.message);
          set({ activeGroup: prevGroup, error: error.message });
        } else {
          set({ error: null });
        }
      },

      // ------------------------------------------------------------------
      // updateGroupStatus
      // ------------------------------------------------------------------
      updateGroupStatus: async (status) => {
        const { activeGroup } = get();
        if (!activeGroup) return;

        const prevGroup = activeGroup;
        // Optimistic
        set({ activeGroup: { ...activeGroup, status } });

        const { error } = await supabase
          .from('trip_groups')
          .update({ status })
          .eq('id', activeGroup.id);

        if (error) {
          console.error('[groupStore] updateGroupStatus error:', error.message);
          set({ activeGroup: prevGroup, error: error.message });
        } else {
          set({ error: null });
        }
      },

      // ------------------------------------------------------------------
      // loadGroup — fetch by invite code (for JoinGroup page)
      // ------------------------------------------------------------------
      loadGroup: async (inviteCode) => {
        set({ loading: true, error: null });

        const { data: groupRow, error: groupErr } = await supabase
          .from('trip_groups')
          .select('*')
          .eq('invite_code', inviteCode)
          .single();

        if (groupErr || !groupRow) {
          console.error('[groupStore] loadGroup error:', groupErr?.message);
          set({ loading: false, error: groupErr?.message ?? 'Group not found' });
          return null;
        }

        const { data: memberRows, error: memberErr } = await supabase
          .from('group_members')
          .select('*')
          .eq('group_id', groupRow.id);

        if (memberErr) {
          console.error('[groupStore] loadGroup members error:', memberErr.message);
          set({ loading: false, error: memberErr.message });
          return null;
        }

        const group = mapGroupRow(
          groupRow as unknown as DbGroupRow,
          (memberRows ?? []) as unknown as DbMemberRow[]
        );
        set({ activeGroup: group, loading: false, error: null });
        return group;
      },

      // ------------------------------------------------------------------
      // loadUserGroup — fetch group where user is organizer or member
      // ------------------------------------------------------------------
      loadUserGroup: async (userId) => {
        set({ loading: true, error: null });

        // First check if the user is an organizer of any group
        const { data: ownedGroup } = await supabase
          .from('trip_groups')
          .select('*')
          .eq('organizer_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        let groupRow = ownedGroup;

        // If not an organizer, check membership
        if (!groupRow) {
          const { data: membership } = await supabase
            .from('group_members')
            .select('group_id')
            .eq('user_id', userId)
            .limit(1)
            .maybeSingle();

          if (membership) {
            const { data } = await supabase
              .from('trip_groups')
              .select('*')
              .eq('id', membership.group_id)
              .single();
            groupRow = data;
          }
        }

        if (!groupRow) {
          set({ loading: false });
          return null;
        }

        const { data: memberRows } = await supabase
          .from('group_members')
          .select('*')
          .eq('group_id', groupRow.id);

        const group = mapGroupRow(
          groupRow as unknown as DbGroupRow,
          (memberRows ?? []) as unknown as DbMemberRow[]
        );
        set({ activeGroup: group, loading: false, error: null });
        return group;
      },

      // ------------------------------------------------------------------
      // Derived / utility
      // ------------------------------------------------------------------
      getMemberCount: () => get().activeGroup?.members.length ?? 0,

      getConfirmedCount: () =>
        get().activeGroup?.members.filter((m) => m.rsvpStatus === 'confirmed').length ?? 0,

      clearGroup: () => set({ activeGroup: null, error: null }),
    }),
    { name: 'group-store' }
  )
);
