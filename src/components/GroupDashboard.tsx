import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Check,
  Clock,
  Copy,
  Link2,
  Mail,
  Phone,
  Plus,
  Trash2,
  UserPlus,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { useGroupStore, type GroupMember, type RsvpStatus } from '../store/groupStore';
import { useFeature } from '../hooks/useNiche';
import { tc } from '../config/themeClasses';

/* ── RSVP badge ── */
const rsvpStyles: Record<RsvpStatus, { bg: string; text: string }> = {
  confirmed: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  pending:   { bg: 'bg-amber-100',   text: 'text-amber-700' },
  declined:  { bg: 'bg-red-100',     text: 'text-red-700' },
};

function RsvpBadge({ status }: { status: RsvpStatus }) {
  const { t } = useTranslation();
  const style = rsvpStyles[status];
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${style.bg} ${style.text}`}>
      {t(`group.${status}`)}
    </span>
  );
}

/* ── Add member form ── */
function AddMemberForm({ onAdd, onClose }: { onAdd: (m: { name: string; email?: string; phone?: string }) => void; onClose: () => void }) {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({ name: name.trim(), email: email.trim() || undefined, phone: phone.trim() || undefined });
    setName('');
    setEmail('');
    setPhone('');
    onClose();
  };

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="overflow-hidden"
    >
      <div className={`space-y-3 rounded-xl border ${tc.borderPrimaryLight} ${tc.bgPrimaryLight}/50 p-4`}>
        <div className="flex items-center justify-between">
          <p className={`text-xs font-semibold uppercase tracking-wider ${tc.textPrimary}`}>{t('group.addGuest')}</p>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={14} />
          </button>
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t('review.fullName')}
          required
          className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none ${tc.focusInput}`}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('review.email')}
            className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none ${tc.focusInput}`}
          />
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t('review.phone')}
            className={`w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none ${tc.focusInput}`}
          />
        </div>
        <button
          type="submit"
          className={`w-full rounded-xl ${tc.btnGradient} py-2 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md`}
        >
          {t('group.addGuest')}
        </button>
      </div>
    </motion.form>
  );
}

/* ── Member row ── */
function MemberRow({
  member,
  isOrganizer,
  canManage,
  onUpdateRsvp,
  onRemove,
}: {
  member: GroupMember;
  isOrganizer: boolean;
  canManage: boolean;
  onUpdateRsvp: (id: string, status: RsvpStatus) => void;
  onRemove: (id: string) => void;
}) {
  const { t } = useTranslation();
  const initials = member.name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="group flex items-center gap-3 rounded-xl border border-slate-200 p-3 transition-colors hover:bg-slate-50"
    >
      {/* Avatar */}
      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
        isOrganizer ? `bg-gradient-to-br ${tc.avatarGradient}` : 'bg-gradient-to-br from-slate-400 to-slate-500'
      }`}>
        {initials}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-slate-900">{member.name}</p>
          {isOrganizer && (
            <span className={`rounded-full ${tc.badgeMuted} px-2 py-0.5 text-[10px] font-semibold`}>
              {t('group.organizer')}
            </span>
          )}
          <RsvpBadge status={member.rsvpStatus} />
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {member.email && (
            <span className="flex items-center gap-1"><Mail size={10} />{member.email}</span>
          )}
          {member.phone && (
            <span className="flex items-center gap-1"><Phone size={10} />{member.phone}</span>
          )}
          {member.dietaryRestrictions && (
            <span className="text-amber-500">Diet: {member.dietaryRestrictions}</span>
          )}
        </div>
      </div>

      {/* Actions */}
      {canManage && !isOrganizer && (
        <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
          {member.rsvpStatus !== 'confirmed' && (
            <button
              onClick={() => onUpdateRsvp(member.id, 'confirmed')}
              className="rounded-lg p-1.5 text-emerald-500 hover:bg-emerald-50"
              title="Mark confirmed"
            >
              <Check size={14} />
            </button>
          )}
          {member.rsvpStatus !== 'declined' && (
            <button
              onClick={() => onUpdateRsvp(member.id, 'declined')}
              className="rounded-lg p-1.5 text-red-400 hover:bg-red-50"
              title="Mark declined"
            >
              <XCircle size={14} />
            </button>
          )}
          <button
            onClick={() => onRemove(member.id)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
            title="Remove"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}
    </motion.div>
  );
}

/* ── Create group form ── */
function CreateGroupForm() {
  const { t } = useTranslation();
  const { createGroup } = useGroupStore();
  const [groupName, setGroupName] = useState('');
  const [organizerName, setOrganizerName] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || !organizerName.trim()) return;
    createGroup(groupName.trim(), organizerName.trim(), 'local-user');
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className={`flex items-center gap-2 ${tc.textPrimary}`}>
        <Users size={18} />
        <h2 className="font-semibold">{t('group.title')}</h2>
      </div>
      <p className="mt-1 text-sm text-slate-500">{t('group.createDescription')}</p>

      <form onSubmit={handleCreate} className="mt-5 space-y-3">
        <input
          type="text"
          value={groupName}
          onChange={(e) => setGroupName(e.target.value)}
          placeholder={t('group.groupNamePlaceholder')}
          required
          className={`w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none ${tc.focusInput}`}
        />
        <input
          type="text"
          value={organizerName}
          onChange={(e) => setOrganizerName(e.target.value)}
          placeholder={t('review.fullName')}
          required
          className={`w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none ${tc.focusInput}`}
        />
        <button
          type="submit"
          className={`w-full rounded-xl ${tc.btnGradient} py-3 text-sm font-semibold text-white shadow-sm transition-all hover:shadow-md`}
        >
          <span className="flex items-center justify-center gap-2">
            <UserPlus size={16} />
            {t('group.createGroup')}
          </span>
        </button>
      </form>
    </div>
  );
}

/* ── Main Group Dashboard ── */
export function GroupDashboard() {
  const { t } = useTranslation();
  const groupBookingEnabled = useFeature('groupBooking');
  const guestListEnabled = useFeature('guestList');
  const { activeGroup, addMember, removeMember, updateRsvp } = useGroupStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  if (!groupBookingEnabled) return null;
  if (!activeGroup) return <CreateGroupForm />;

  const { members, inviteCode, name } = activeGroup;
  const confirmedCount = members.filter((m) => m.rsvpStatus === 'confirmed').length;
  const inviteLink = `${window.location.origin}/join/${inviteCode}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(inviteLink);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-100 p-5">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Users size={16} className={tc.textPrimaryMid} />
              <h2 className="font-semibold text-slate-900">{name}</h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-500">
              {confirmedCount} {t('group.confirmed').toLowerCase()} · {members.length} {t('common.guests').toLowerCase()}
            </p>
          </div>
        </div>

        {/* Invite link */}
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2">
          <Link2 size={14} className="shrink-0 text-slate-400" />
          <span className="flex-1 truncate text-xs text-slate-500">{inviteLink}</span>
          <button
            onClick={copyLink}
            className={`flex shrink-0 items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-all ${
              linkCopied
                ? 'bg-emerald-100 text-emerald-600'
                : 'bg-white text-slate-600 shadow-sm hover:bg-slate-100'
            }`}
          >
            {linkCopied ? <Check size={12} /> : <Copy size={12} />}
            {linkCopied ? t('group.linkCopied') : t('group.copyLink')}
          </button>
        </div>
      </div>

      {/* Members list */}
      <div className="p-5">
        {guestListEnabled && (
          <>
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {t('group.guestList')}
              </p>
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className={`flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium ${tc.textPrimary} transition-colors ${tc.hoverBgPrimaryLight}`}
              >
                <Plus size={12} />
                {t('group.addGuest')}
              </button>
            </div>

            <div className="mt-3 space-y-2">
              <AnimatePresence>
                {showAddForm && (
                  <AddMemberForm
                    onAdd={(m) => addMember(m)}
                    onClose={() => setShowAddForm(false)}
                  />
                )}
              </AnimatePresence>

              <AnimatePresence mode="popLayout">
                {members.map((member) => (
                  <MemberRow
                    key={member.id}
                    member={member}
                    isOrganizer={member.role === 'organizer'}
                    canManage={true}
                    onUpdateRsvp={updateRsvp}
                    onRemove={removeMember}
                  />
                ))}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* Summary bar */}
        <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Check size={12} className="text-emerald-500" />
              {confirmedCount} {t('group.confirmed').toLowerCase()}
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} className="text-amber-500" />
              {members.filter((m) => m.rsvpStatus === 'pending').length} {t('group.pending').toLowerCase()}
            </span>
            <span className="flex items-center gap-1">
              <XCircle size={12} className="text-red-400" />
              {members.filter((m) => m.rsvpStatus === 'declined').length} {t('group.declined').toLowerCase()}
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-700">
            {members.length} {t('common.guests').toLowerCase()}
          </span>
        </div>
      </div>
    </div>
  );
}
