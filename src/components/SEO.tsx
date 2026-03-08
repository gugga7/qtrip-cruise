import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { activeNiche } from '../config/niche';

interface SEOProps {
  title?: string;
  description?: string;
  path?: string;
  type?: string;
  image?: string;
  noIndex?: boolean;
}

const BASE_URL = 'https://qtrip.app';

export const SEO: React.FC<SEOProps> = ({
  title,
  description,
  path = '',
  type = 'website',
  image = `${BASE_URL}/og-image.svg`,
  noIndex = false,
}) => {
  const { i18n } = useTranslation();
  const lang = i18n.language;

  const defaultTitle = activeNiche.theme.appName;
  const defaultDesc =
    activeNiche.theme.description[lang] ?? activeNiche.theme.description.en;

  const fullTitle = title ? `${title} | ${defaultTitle}` : `${defaultTitle} — ${activeNiche.theme.tagline[lang] ?? activeNiche.theme.tagline.en}`;
  const finalDesc = description ?? defaultDesc;
  const canonical = `${BASE_URL}${path}`;
  const altLang = lang === 'fr' ? 'en' : 'fr';

  return (
    <Helmet>
      <html lang={lang} />
      <title>{fullTitle}</title>
      <meta name="description" content={finalDesc} />
      {noIndex && <meta name="robots" content="noindex,nofollow" />}

      {/* Canonical + hreflang */}
      <link rel="canonical" href={canonical} />
      <link rel="alternate" hrefLang={lang} href={canonical} />
      <link rel="alternate" hrefLang={altLang} href={canonical} />
      <link rel="alternate" hrefLang="x-default" href={canonical} />

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={finalDesc} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content={defaultTitle} />
      <meta property="og:locale" content={lang === 'fr' ? 'fr_FR' : 'en_US'} />
      <meta property="og:locale:alternate" content={lang === 'fr' ? 'en_US' : 'fr_FR'} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={finalDesc} />
      <meta name="twitter:image" content={image} />
    </Helmet>
  );
};
