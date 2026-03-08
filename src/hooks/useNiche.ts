import { activeNiche, type NicheConfig, type NicheFeatures } from '../config/niche';

/** Returns the active niche configuration */
export function useNiche(): NicheConfig {
  return activeNiche;
}

/** Check if a specific feature is enabled */
export function useFeature(feature: keyof NicheFeatures): boolean {
  return activeNiche.features[feature];
}

/** Get a localized string from a Record<lang, string> using the active niche's default language */
export function useNicheText(texts: Record<string, string>, lang?: string): string {
  const language = lang ?? activeNiche.defaultLanguage;
  return texts[language] ?? texts['en'] ?? Object.values(texts)[0] ?? '';
}
