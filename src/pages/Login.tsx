import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { tc } from '../config/themeClasses';
import { SEO } from '../components/SEO';

export function Login() {
  const { t } = useTranslation();
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as { from?: { pathname: string }; tripId?: string; email?: string; register?: boolean } | null;
  const from = state?.from?.pathname || '/home';

  const [email, setEmail] = useState(state?.email || '');
  const [isSignUp, setIsSignUp] = useState(state?.register || false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }

      // Link trip to newly authenticated user if tripId exists
      if (state?.tripId && supabase) {
        const { data: { user: authUser } } = await supabase.auth.getUser();
        if (authUser) {
          await supabase
            .from('trips')
            .update({ user_id: authUser.id })
            .eq('id', state.tripId)
            .is('user_id', null);
        }
        navigate('/booking', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${tc.loginBg} py-12 px-4 sm:px-6 lg:px-8`}>
      <SEO title={isSignUp ? t('login.signUp') : t('login.signIn')} path="/login" noIndex />
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-lg">
        <div>
          <h2 className="text-center text-2xl font-bold text-slate-900">
            {isSignUp ? t('auth.createAccount') : t('auth.signInAccount')}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email-address" className="sr-only">
                {t('auth.emailAddress')}
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className={`appearance-none relative block w-full px-4 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none ${tc.focusInput} focus:z-10 text-sm`}
                placeholder={t('auth.emailAddress')}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                {t('auth.password')}
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={`appearance-none relative block w-full px-4 py-3 border border-slate-200 placeholder-slate-400 text-slate-900 rounded-xl focus:outline-none ${tc.focusInput} focus:z-10 text-sm`}
                placeholder={t('auth.password')}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="text-sm text-red-700">{error}</div>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-2xl text-white ${tc.btnGradient} shadow-lg ${tc.btnGradientHover} focus:outline-none focus:ring-2 focus:ring-offset-2 ${tc.focusRingPrimary} transition-all disabled:opacity-50`}
            >
              {loading ? (
                <span>{t('common.loading')}</span>
              ) : (
                <span>{isSignUp ? t('auth.signUp') : t('auth.signIn')}</span>
              )}
            </button>
          </div>

          <div className="text-sm text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className={`font-medium ${tc.textPrimary} ${tc.hoverTextPrimaryLight}`}
            >
              {isSignUp
                ? t('auth.hasAccount')
                : t('auth.noAccount')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
