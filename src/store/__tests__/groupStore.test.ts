import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useGroupStore } from '../groupStore';

// Mock Supabase — all DB calls resolve successfully, echoing inserted data
vi.mock('../../lib/supabase', () => {
  let idCounter = 0;

  const mockChain = () => {
    let insertedData: Record<string, any> | null = null;
    const chain: Record<string, any> = {};

    chain.insert = vi.fn().mockImplementation((data: Record<string, any>) => {
      insertedData = { id: `db-${++idCounter}`, created_at: new Date().toISOString(), updated_at: new Date().toISOString(), ...data };
      return chain;
    });
    chain.select = vi.fn().mockReturnValue(chain);
    chain.single = vi.fn().mockImplementation(() =>
      Promise.resolve({ data: insertedData ?? { id: `db-${++idCounter}` }, error: null })
    );
    chain.update = vi.fn().mockReturnValue(chain);
    chain.delete = vi.fn().mockReturnValue(chain);
    chain.eq = vi.fn().mockReturnValue(chain);
    chain.maybeSingle = vi.fn().mockResolvedValue({ data: null, error: null });
    chain.order = vi.fn().mockReturnValue(chain);
    chain.limit = vi.fn().mockReturnValue(chain);
    return chain;
  };

  return {
    supabase: {
      from: vi.fn().mockImplementation(() => mockChain()),
    },
  };
});

describe('groupStore', () => {
  beforeEach(() => {
    useGroupStore.getState().clearGroup();
  });

  it('creates a group with an organizer', async () => {
    const group = await useGroupStore.getState().createGroup('Beach Trip', 'Alice', 'org-1');
    expect(group.status).toBe('planning');
    expect(group.members).toHaveLength(1);

    // Should also set as activeGroup
    expect(useGroupStore.getState().activeGroup?.id).toBe(group.id);
  });

  it('adds and removes members (optimistic update)', async () => {
    await useGroupStore.getState().createGroup('Beach Trip', 'Alice', 'org-1');

    await useGroupStore.getState().addMember({ name: 'Bob', email: 'bob@test.com' });
    await useGroupStore.getState().addMember({ name: 'Charlie' });

    const state = useGroupStore.getState();
    expect(state.activeGroup?.members).toHaveLength(3);
    expect(state.getMemberCount()).toBe(3);

    // Remove second member (index 1)
    const secondMember = state.activeGroup!.members[1];
    await useGroupStore.getState().removeMember(secondMember.id);
    expect(useGroupStore.getState().activeGroup?.members).toHaveLength(2);
    expect(useGroupStore.getState().getMemberCount()).toBe(2);
  });

  it('updates RSVP status', async () => {
    await useGroupStore.getState().createGroup('Beach Trip', 'Alice', 'org-1');
    await useGroupStore.getState().addMember({ name: 'Bob' });

    const bob = useGroupStore.getState().activeGroup!.members.find((m) => m.name === 'Bob')!;
    expect(bob.rsvpStatus).toBe('pending');

    await useGroupStore.getState().updateRsvp(bob.id, 'confirmed');
    const updatedBob = useGroupStore.getState().activeGroup!.members.find((m) => m.name === 'Bob')!;
    expect(updatedBob.rsvpStatus).toBe('confirmed');

    // Confirmed count should now be 2 (Alice + Bob)
    expect(useGroupStore.getState().getConfirmedCount()).toBe(2);
  });

  it('sets and clears active group', async () => {
    const group = await useGroupStore.getState().createGroup('Trip', 'Alice', 'org-1');
    expect(useGroupStore.getState().activeGroup).not.toBeNull();

    useGroupStore.getState().setActiveGroup(null);
    expect(useGroupStore.getState().activeGroup).toBeNull();

    useGroupStore.getState().setActiveGroup(group);
    expect(useGroupStore.getState().activeGroup?.id).toBe(group.id);
  });

  it('updates group status', async () => {
    await useGroupStore.getState().createGroup('Trip', 'Alice', 'org-1');
    await useGroupStore.getState().updateGroupStatus('confirmed');
    expect(useGroupStore.getState().activeGroup?.status).toBe('confirmed');
  });
});
