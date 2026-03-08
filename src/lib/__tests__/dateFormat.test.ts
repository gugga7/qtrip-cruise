import { describe, it, expect } from 'vitest';
import { formatDate } from '../dateFormat';
import i18n from '../i18n';

describe('formatDate', () => {
  it('formats date in English', async () => {
    await i18n.changeLanguage('en');
    const result = formatDate(new Date('2026-06-15'), 'MMMM d, yyyy');
    expect(result).toBe('June 15, 2026');
  });

  it('formats date in French', async () => {
    await i18n.changeLanguage('fr');
    const result = formatDate(new Date('2026-06-15'), 'MMMM d, yyyy');
    expect(result).toBe('juin 15, 2026');
  });

  it('accepts string dates', async () => {
    await i18n.changeLanguage('en');
    const result = formatDate('2026-12-25', 'MMM d');
    expect(result).toBe('Dec 25');
  });
});
