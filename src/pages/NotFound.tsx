import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, ArrowLeft, Home } from 'lucide-react';
import { motion } from 'framer-motion';
import { activeNiche } from '../config/niche';
import { tc } from '../config/themeClasses';
import { SEO } from '../components/SEO';

export function NotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <SEO title={t('notFound.title')} noIndex />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md text-center"
      >
        <div className={`mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br ${activeNiche.theme.heroGradient} text-white shadow-lg`}>
          <MapPin size={36} />
        </div>

        <h1 className="mt-6 text-6xl font-bold text-slate-900">404</h1>
        <p className="mt-2 text-lg font-medium text-slate-600">{t('notFound.title')}</p>
        <p className="mt-2 text-sm text-slate-400">{t('notFound.message')}</p>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            {t('notFound.goBack')}
          </button>
          <button
            onClick={() => navigate('/home')}
            className={`flex items-center justify-center gap-2 rounded-xl ${tc.btnGradient} px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md`}
          >
            <Home size={16} />
            {t('notFound.goHome')}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
