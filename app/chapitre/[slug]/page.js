import { EVENT_SEO, SLUG_TO_ID, getAllSlugs } from '../../../data/seo';
import { E } from '../../../data/events';
import ChapterContent from './ChapterContent';

// Generate all 64 static pages at build time
export function generateStaticParams() {
  return getAllSlugs();
}

// Unique meta tags per chapter
export function generateMetadata({ params }) {
  const seo = Object.values(EVENT_SEO).find(s => s.slug === params.slug);
  if (!seo) return { title: 'Chapitre introuvable — Nûr As-Sîrah' };

  return {
    title: `${seo.title} — Nûr As-Sîrah`,
    description: seo.meta,
    openGraph: {
      title: `${seo.title} — Nûr As-Sîrah`,
      description: seo.meta,
      url: `https://sirahduprophete.fr/chapitre/${seo.slug}`,
      siteName: 'Nûr As-Sîrah',
      locale: 'fr_FR',
      type: 'article',
    },
    alternates: {
      canonical: `https://sirahduprophete.fr/chapitre/${seo.slug}`,
    },
  };
}

export default function ChapterPage({ params }) {
  const eventId = SLUG_TO_ID[params.slug];
  const ev = E.find(e => e.id === eventId);
  const seo = EVENT_SEO[eventId];

  if (!ev || !seo) {
    return (
      <div style={{ padding: '4rem 1rem', textAlign: 'center', fontFamily: 'system-ui, sans-serif', color: '#2c1810' }}>
        <h1 style={{ fontSize: '1.5rem' }}>Chapitre introuvable</h1>
        <p style={{ marginTop: '1rem' }}>
          <a href="/" style={{ color: '#b8860b' }}>← Retour à l'application</a>
        </p>
      </div>
    );
  }

  // Build JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: seo.title,
    description: seo.meta,
    url: `https://sirahduprophete.fr/chapitre/${seo.slug}`,
    inLanguage: 'fr',
    isPartOf: {
      '@type': 'WebSite',
      name: 'Nûr As-Sîrah',
      url: 'https://sirahduprophete.fr',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Nûr As-Sîrah',
    },
  };

  // Find prev/next for navigation
  const allIds = Object.keys(EVENT_SEO).map(Number).sort((a, b) => a - b);
  const idx = allIds.indexOf(eventId);
  const prevSeo = idx > 0 ? EVENT_SEO[allIds[idx - 1]] : null;
  const nextSeo = idx < allIds.length - 1 ? EVENT_SEO[allIds[idx + 1]] : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ChapterContent
        ev={ev}
        seo={seo}
        prevSeo={prevSeo}
        nextSeo={nextSeo}
      />
    </>
  );
}
