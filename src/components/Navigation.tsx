import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, MapPin, Sparkles, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from './LanguageSwitcher';
import { useFeature } from '../hooks/useNiche';
import { activeNiche } from '../config/niche';
import { tc } from '../config/themeClasses';

interface Step {
  id: number;
  title: string;
  path: string;
}

interface NavigationProps {
  steps: Step[];
  currentStep: number;
  onStepChange: (step: number) => void;
}

export function Navigation({ steps, currentStep, onStepChange }: NavigationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t, i18n } = useTranslation();
  const profileEnabled = useFeature('profilePage');
  const lang = i18n.language?.split('-')[0] || 'en';
  const tagline = activeNiche.theme.tagline[lang] || activeNiche.theme.tagline['en'];

  const toggleMenu = () => setIsOpen(!isOpen);

  const navLinks = [
    { label: t('nav.preferences'), icon: MapPin, step: 1 },
    { label: t('nav.plan') || 'Shore Plan', icon: Sparkles, step: 2 },
    { label: t('nav.review'), icon: Clock, step: 3 },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50">
        {/* ── Row 1: Branded header ── */}
        <div className="bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-14 sm:h-16">
              {/* Left: mobile hamburger + Logo */}
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleMenu}
                  aria-label={isOpen ? 'Close menu' : 'Open menu'}
                  className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  {isOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
                <Link to="/home" className="flex items-center gap-2">
                  <span className={`text-xl font-bold tracking-tight bg-gradient-to-r ${tc.heroGradient} bg-clip-text text-transparent`}>
                    {activeNiche.theme.appName}
                  </span>
                </Link>
              </div>

              {/* Center: nav links (desktop) */}
              <div className="hidden md:flex items-center gap-1">
                {navLinks.map(({ label, icon: Icon, step }) => (
                  <button
                    key={step}
                    onClick={() => onStepChange(step)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      currentStep === step
                        ? `${tc.textPrimary} ${tc.bgPrimaryLight}`
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    <Icon size={16} className={currentStep === step ? tc.textPrimaryMid : 'text-slate-400'} />
                    {label}
                  </button>
                ))}
              </div>

              {/* Right: language, profile, sign-in */}
              <div className="flex items-center gap-2">
                <LanguageSwitcher />
                {profileEnabled && (
                  <Link
                    to="/profile"
                    aria-label="Profile"
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${tc.bgPrimaryMuted} ${tc.textPrimary} transition-colors ${tc.hoverBgPrimarySubtle}`}
                  >
                    <User size={16} />
                  </Link>
                )}
                <Link
                  to="/login"
                  className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium ${tc.textPrimary} ${tc.hoverBgPrimaryLight} transition-colors`}
                >
                  {t('nav.signIn')}
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ── Row 2: Tagline banner ── */}
        <div className={`bg-gradient-to-r ${tc.heroGradient} text-white`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <p className="text-center text-xs sm:text-sm font-medium py-1.5 tracking-wide">
              {tagline}
            </p>
          </div>
        </div>

        {/* ── Row 3: Step progress bar (desktop) ── */}
        <div className="hidden md:block bg-white border-b border-slate-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            <div className="flex items-center py-3">
              {steps.map((step, index) => {
                const isCompleted = step.id < currentStep;
                const isCurrent = step.id === currentStep;

                return (
                  <div key={step.id} className="flex items-center flex-1 last:flex-none">
                    <button
                      onClick={() => onStepChange(step.id)}
                      className="flex items-center gap-2.5 z-10 bg-white pr-2"
                    >
                      <div
                        className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold transition-all ${
                          isCurrent
                            ? `bg-gradient-to-br ${tc.heroGradient} text-white shadow-sm`
                            : isCompleted
                              ? 'bg-green-500 text-white'
                              : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {isCompleted ? (
                          <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        ) : (
                          step.id
                        )}
                      </div>
                      <span
                        className={`text-sm font-medium whitespace-nowrap transition-colors ${
                          isCurrent
                            ? tc.textPrimaryDark
                            : isCompleted
                              ? 'text-green-600'
                              : 'text-slate-400'
                        }`}
                      >
                        {step.title}
                      </span>
                    </button>

                    {/* Connector line */}
                    {index < steps.length - 1 && (
                      <div className="flex-1 mx-3">
                        <div
                          className={`h-[2px] rounded-full transition-colors ${
                            isCompleted
                              ? 'bg-green-400'
                              : isCurrent
                                ? tc.bgPrimaryMuted
                                : 'bg-slate-100'
                          }`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Mobile menu ── */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-b border-slate-200 shadow-lg"
            >
              <div className="px-4 py-3 space-y-1">
                {steps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => { onStepChange(step.id); setIsOpen(false); }}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl w-full text-sm font-medium transition-colors ${
                      currentStep === step.id
                        ? `${tc.bgPrimaryLight} ${tc.textPrimary}`
                        : step.id < currentStep
                          ? 'text-green-600'
                          : 'text-slate-500'
                    }`}
                  >
                    <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold ${
                      currentStep === step.id
                        ? `bg-gradient-to-br ${tc.heroGradient} text-white`
                        : step.id < currentStep
                          ? 'bg-green-500 text-white'
                          : 'bg-slate-200 text-slate-500'
                    }`}>
                      {step.id < currentStep ? (
                        <svg className="w-3 h-3" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : step.id}
                    </div>
                    {step.title}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
      {/* Spacer: header (56/64px) + tagline (32px) + step bar (52px) */}
      <div className="h-[120px] sm:h-[148px]" />
    </>
  );
}
