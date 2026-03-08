import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Users, PartyPopper, AlertCircle, Loader2 } from 'lucide-react';
import { useGroupStore } from '../store/groupStore';
import { tc } from '../config/themeClasses';

export function JoinGroup() {
  const { code } = useParams<{ code: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { activeGroup, addMember, loadGroup, loading } = useGroupStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'form' | 'joining' | 'success' | 'error'>('form');

  // Load the group from Supabase when the page mounts (if not already loaded)
  useEffect(() => {
    if (code && activeGroup?.inviteCode !== code.toUpperCase()) {
      loadGroup(code.toUpperCase());
    }
  }, [code, activeGroup?.inviteCode, loadGroup]);

  const codeMatch = activeGroup?.inviteCode === code?.toUpperCase();

  const handleJoin = async () => {
    if (!name.trim() || !codeMatch) return;
    setStatus('joining');
    try {
      await addMember({ name: name.trim(), email: email.trim() || undefined });
      setStatus('success');
    } catch {
      setStatus('error');
    }
  };

  // Loading state while fetching group from Supabase
  if (loading) {
    return (
      <div className={`flex min-h-screen items-center justify-center bg-gradient-to-br ${tc.loginBg} px-4`}>
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <Loader2 size={32} className={`mx-auto animate-spin ${tc.textPrimaryMid}`} />
          <p className="mt-4 text-sm text-slate-500">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  // Success state
  if (status === 'success') {
    return (
      <div className={`flex min-h-screen items-center justify-center bg-gradient-to-br ${tc.loginBg} px-4`}>
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
            <PartyPopper className="text-emerald-600" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{t('joinGroup.joinSuccess')}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {activeGroup?.name}
          </p>
          <button
            onClick={() => navigate('/preferences')}
            className={`mt-6 w-full rounded-2xl ${tc.btnGradient} px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg`}
          >
            {t('home.startPlanning')}
          </button>
        </div>
      </div>
    );
  }

  // Invalid code state
  if (!codeMatch) {
    return (
      <div className={`flex min-h-screen items-center justify-center bg-gradient-to-br ${tc.loginBg} px-4`}>
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="text-red-500" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{t('joinGroup.invalidCode')}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {t('joinGroup.subtitle')}
          </p>
          <button
            onClick={() => navigate('/home')}
            className="mt-6 w-full rounded-2xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  // Join form
  return (
    <div className={`flex min-h-screen items-center justify-center bg-gradient-to-br ${tc.loginBg} px-4`}>
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full ${tc.bgPrimaryMuted}`}>
            <Users className={tc.textPrimary} size={28} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">{t('joinGroup.title')}</h1>
          <p className="mt-2 text-sm text-slate-500">{t('joinGroup.subtitle')}</p>
          {activeGroup && (
            <p className={`mt-3 rounded-2xl ${tc.bgPrimaryLight} px-4 py-2 text-sm font-semibold ${tc.textPrimaryDark}`}>
              {activeGroup.name}
            </p>
          )}
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {t('joinGroup.enterName')}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:outline-none ${tc.focusInput}`}
              placeholder="Alex"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              {t('joinGroup.enterEmail')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700 focus:outline-none ${tc.focusInput}`}
              placeholder="alex@example.com"
            />
          </div>
          <button
            onClick={handleJoin}
            disabled={!name.trim() || status === 'joining'}
            className={`w-full rounded-2xl ${tc.btnGradient} px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:shadow-lg disabled:opacity-50`}
          >
            {status === 'joining' ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                {t('joinGroup.joining')}
              </span>
            ) : (
              t('joinGroup.joinButton')
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
