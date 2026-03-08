import { format as dateFnsFormat } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { enUS } from 'date-fns/locale/en-US';
import i18n from './i18n';

const locales: Record<string, Locale> = { en: enUS, fr };

/** Locale-aware date format. Uses the current i18n language. */
export function formatDate(date: Date | string, pattern: string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const locale = locales[i18n.language] ?? enUS;
  return dateFnsFormat(d, pattern, { locale });
}
