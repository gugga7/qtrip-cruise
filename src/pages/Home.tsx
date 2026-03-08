import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Sparkles, Users, Calendar, MapPin, ArrowRight, PartyPopper, Star, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { activeNiche } from '../config/niche';
import { useDestinations } from '../hooks/useCatalog';
import { tc } from '../config/themeClasses';
import { SEO } from '../components/SEO';

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0 } };

export const Home = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { destinations } = useDestinations();
  const lang = i18n.language;
  const tagline = activeNiche.theme.tagline[lang] ?? activeNiche.theme.tagline.en;
  const description = activeNiche.theme.description[lang] ?? activeNiche.theme.description.en;
  const nicheName = activeNiche.name[lang] ?? activeNiche.name.en;

  return (
    <div className="min-h-screen bg-white">
      <SEO path="/home" />
      {/* ── Hero ── */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${activeNiche.theme.heroGradient} px-4 pb-20 pt-16 sm:pb-28 sm:pt-24`}>
        {/* Decorative circles */}
        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-16 -right-16 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <motion.div
          initial="hidden"
          animate="show"
          transition={{ staggerChildren: 0.12 }}
          className="relative mx-auto max-w-4xl text-center"
        >
          <motion.div variants={fadeUp} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              <PartyPopper size={14} /> {nicheName}
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mt-6 text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl"
          >
            {tagline}
          </motion.h1>

          <motion.p
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mx-auto mt-5 max-w-2xl text-base text-white/80 sm:text-lg"
          >
            {description}
          </motion.p>

          <motion.div variants={fadeUp} transition={{ duration: 0.5 }} className="mt-8 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate('/preferences')}
              className={`group flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-sm font-semibold ${tc.textPrimary} shadow-lg transition-all hover:shadow-xl`}
            >
              {t('home.startPlanning')}
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            variants={fadeUp}
            transition={{ duration: 0.5 }}
            className="mt-8 flex flex-wrap justify-center gap-4 text-xs text-white/70"
          >
            <span className="flex items-center gap-1.5"><Shield size={12} /> {t('preferences.noPayment')}</span>
            <span className="flex items-center gap-1.5"><Sparkles size={12} /> {t('preferences.fastQuote')}</span>
            <span className="flex items-center gap-1.5"><Star size={12} /> {t('preferences.curatedStays')}</span>
          </motion.div>
        </motion.div>
      </section>

      {/* ── Destinations ── */}
      <section className="relative -mt-12 px-4 sm:-mt-16">
        <div className="mx-auto max-w-5xl">
          <div className="grid gap-4 sm:grid-cols-3">
            {destinations.map((dest, i) => (
              <motion.button
                key={dest.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
                onClick={() => navigate('/preferences')}
                className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <img
                  src={dest.heroImageUrl}
                  alt={dest.name}
                  className="h-40 w-full object-cover transition-transform group-hover:scale-105"
                />
                <div className="p-4 text-left">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin size={12} />
                    {dest.country}
                  </div>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">{dest.name}</h3>
                  <p className="mt-1 line-clamp-2 text-xs text-slate-500">{dest.description}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="mx-auto max-w-4xl px-4 py-16 sm:py-20">
        <h2 className="text-center text-2xl font-bold text-slate-900 sm:text-3xl">
          {t('home.howItWorks')}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-center text-sm text-slate-500">
          {t('home.howItWorksSub')}
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          {[
            {
              icon: MapPin,
              color: tc.howItWorksPrimary,
              title: t('home.stepChoose'),
              desc: t('home.stepChooseDesc'),
            },
            {
              icon: Calendar,
              color: tc.howItWorksAccent,
              title: t('home.stepPlan'),
              desc: t('home.stepPlanDesc'),
            },
            {
              icon: Users,
              color: tc.badgeAccent,
              title: t('home.stepBook'),
              desc: t('home.stepBookDesc'),
            },
          ].map(({ icon: Icon, color, title, desc }, i) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm"
            >
              <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${color}`}>
                <Icon size={22} />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-500">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="px-4 pb-16">
        <div className={`mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-r ${activeNiche.theme.heroGradient} p-8 text-center text-white sm:p-12`}>
          <h2 className="text-2xl font-bold sm:text-3xl">
            {t('home.readyTitle')}
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-sm text-white/80">
            {t('home.readySubtitle')}
          </p>
          <button
            onClick={() => navigate('/preferences')}
            className={`mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-3.5 text-sm font-semibold ${tc.textPrimary} shadow-lg transition-all hover:shadow-xl`}
          >
            {t('home.startPlanning')}
            <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-slate-200 bg-white px-4 py-8">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} QTRIP. {t('home.allRights')}
          </p>
          <div className="flex gap-6 text-xs text-slate-400">
            <span className="cursor-pointer hover:text-slate-600">{t('home.terms')}</span>
            <span className="cursor-pointer hover:text-slate-600">{t('home.privacy')}</span>
            <span className="cursor-pointer hover:text-slate-600">{t('home.contact')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
