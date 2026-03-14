import { useTranslation } from 'react-i18next';
import { activeNiche } from '../config/niche';

const languageLabels: Record<string, string> = {
  en: 'EN',
  fr: 'FR',
  es: 'ES',
};

const languageNames: Record<string, string> = {
  en: 'English',
  fr: 'French',
  es: 'Spanish',
};

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const languages = activeNiche.supportedLanguages;

  if (languages.length <= 1) return null;

  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-slate-100 p-0.5" role="group" aria-label="Language switcher">
      {languages.map((lang) => (
        <button
          key={lang}
          onClick={() => i18n.changeLanguage(lang)}
          aria-label={`Switch to ${languageNames[lang] ?? lang}`}
          aria-pressed={i18n.language === lang}
          className={`rounded-md px-2.5 py-1 text-xs font-semibold transition-all ${
            i18n.language === lang
              ? 'bg-white text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {languageLabels[lang] ?? lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
