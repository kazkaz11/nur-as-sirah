"use client";

const P = {
  bg: "#faf5ed", sf: "#f0e8d8", cd: "#fff8f0", bd: "#d4c4a0",
  tx: "#2c1810", ts: "#6b5a48", gd: "#b8860b", gdd: "#8a6a20"
};

const CC = { life: "#6a9a7e", battle: "#b85a4a", treaty: "#5a8aaa", miracle: "#9a7aaa", migration: "#c49a5a" };
const CL = { life: "Vie & Da'wah", battle: "Bataille", treaty: "Traité", miracle: "Miracle", migration: "Migration" };
const CI = { life: "☪", battle: "⚔️", treaty: "📜", miracle: "✨", migration: "🐫" };

export default function ChapterContent({ ev, seo, prevSeo, nextSeo }) {
  const paras = ev.d.split('\n\n').filter(Boolean);

  return (
    <div style={{ background: P.bg, minHeight: '100vh', fontFamily: "'Georgia', 'Times New Roman', serif" }}>
      {/* Header bar */}
      <header style={{
        background: P.sf, borderBottom: `1px solid ${P.bd}`,
        padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
        position: 'sticky', top: 0, zIndex: 10
      }}>
        <a href="/" style={{
          color: P.gd, textDecoration: 'none', fontWeight: 700, fontSize: '1.1rem',
          display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          ☪ Nûr As-Sîrah
        </a>
        <span style={{ color: P.ts, fontSize: '0.85rem' }}>›</span>
        <span style={{ color: P.ts, fontSize: '0.85rem' }}>Chapitre {ev.id}</span>
      </header>

      <main style={{ maxWidth: 720, margin: '0 auto', padding: '2rem 1rem 4rem' }}>
        {/* Category badge */}
        <div style={{ marginBottom: '1rem' }}>
          <span style={{
            display: 'inline-block', padding: '0.25rem 0.75rem', borderRadius: 20,
            background: CC[ev.c] + '20', color: CC[ev.c], fontSize: '0.8rem', fontWeight: 600
          }}>
            {CI[ev.c]} {CL[ev.c]}
          </span>
          {ev.y && (
            <span style={{ marginLeft: '0.75rem', color: P.ts, fontSize: '0.85rem' }}>
              {ev.y} {ev.h && `(${ev.h})`}
            </span>
          )}
          {ev.loc && (
            <span style={{ marginLeft: '0.75rem', color: P.ts, fontSize: '0.85rem' }}>
              📍 {ev.loc}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 'clamp(1.5rem, 5vw, 2rem)', color: P.tx, lineHeight: 1.3,
          margin: '0 0 0.5rem', fontWeight: 700
        }}>
          {ev.t}
        </h1>

        {ev.ar && (
          <p style={{
            fontSize: '1.3rem', color: P.gd, fontFamily: "'Amiri', serif",
            direction: 'rtl', margin: '0 0 1.5rem'
          }}>
            {ev.ar}
          </p>
        )}

        {/* Main text — all paragraphs rendered for SEO */}
        <article style={{ lineHeight: 1.85, color: P.tx, fontSize: '1.05rem' }}>
          {paras.map((p, j) => {
            // Detect section headers (ALL CAPS lines)
            if (/^[A-ZÀÉÈÊÎÔÛ][A-ZÀÉÈÊÎÔÛ'\- ]{4,}/.test(p.split('\n')[0])) {
              const [head, ...rest] = p.split('\n');
              return (
                <div key={j} style={{ marginBottom: '1.5rem' }}>
                  <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: P.tx, margin: '2rem 0 0.75rem', textTransform: 'none' }}>
                    {head}
                  </h2>
                  {rest.length > 0 && <p style={{ margin: 0 }}>{rest.join('\n')}</p>}
                </div>
              );
            }
            return <p key={j} style={{ marginBottom: '1.25rem' }}>{p}</p>;
          })}
        </article>

        {/* Verse / Gem */}
        {(ev.ay || ev.gem) && (
          <blockquote style={{
            margin: '2rem 0', padding: '1.25rem 1.5rem',
            background: P.cd, borderLeft: `4px solid ${P.gd}`, borderRadius: 8
          }}>
            {ev.ay && (
              <p style={{
                fontSize: '1.3rem', color: P.gd, fontFamily: "'Amiri', serif",
                direction: 'rtl', lineHeight: 2, marginBottom: '0.75rem'
              }}>
                {ev.ay}
              </p>
            )}
            {ev.ayFr && <p style={{ fontStyle: 'italic', color: P.tx, marginBottom: '0.5rem' }}>{ev.ayFr}</p>}
            {ev.ayRef && <p style={{ fontSize: '0.85rem', color: P.ts }}>{ev.ayRef}</p>}
            {!ev.ay && ev.gem && (
              <>
                {ev.gem.ar && (
                  <p style={{ fontSize: '1.2rem', color: P.gd, fontFamily: "'Amiri', serif", direction: 'rtl', lineHeight: 2, marginBottom: '0.75rem' }}>
                    {ev.gem.ar}
                  </p>
                )}
                <p style={{ fontStyle: 'italic', color: P.tx, marginBottom: '0.5rem' }}>{ev.gem.fr}</p>
                <p style={{ fontSize: '0.85rem', color: P.ts }}>{ev.gem.src}</p>
              </>
            )}
          </blockquote>
        )}

        {/* Lesson */}
        {ev.lsn && (
          <div style={{
            margin: '2rem 0', padding: '1.25rem',
            background: '#f0f7f2', border: '1px solid #c8dcc8', borderRadius: 8
          }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#4a7a5a', marginBottom: '0.5rem' }}>
              💡 Leçon & Réflexion
            </h3>
            <p style={{ color: P.tx, lineHeight: 1.7 }}>{ev.lsn}</p>
          </div>
        )}

        {/* Did you know */}
        {ev.fun && (
          <div style={{
            margin: '1.5rem 0', padding: '1.25rem',
            background: '#fdf6e3', border: '1px solid #e8d9a8', borderRadius: 8
          }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: P.gd, marginBottom: '0.5rem' }}>
              🌟 Le savais-tu ?
            </h3>
            <p style={{ color: P.tx, lineHeight: 1.7 }}>{ev.fun}</p>
          </div>
        )}

        {/* Key people */}
        {ev.ppl && ev.ppl.length > 0 && (
          <div style={{ margin: '1.5rem 0' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: P.ts, marginBottom: '0.5rem' }}>
              👥 Personnages clés
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {ev.ppl.map((p, j) => (
                <span key={j} style={{
                  padding: '0.25rem 0.75rem', background: P.sf, border: `1px solid ${P.bd}`,
                  borderRadius: 20, fontSize: '0.85rem', color: P.tx
                }}>{p}</span>
              ))}
            </div>
          </div>
        )}

        {/* Sources */}
        {ev.src && (
          <div style={{ margin: '1.5rem 0', paddingTop: '1rem', borderTop: `1px solid ${P.bd}` }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: P.ts, marginBottom: '0.5rem' }}>
              📚 Sources
            </h3>
            <p style={{ fontSize: '0.85rem', color: P.ts, lineHeight: 1.6 }}>{ev.src}</p>
          </div>
        )}

        {/* CTA: open full app */}
        <div style={{
          margin: '2.5rem 0', padding: '1.5rem', textAlign: 'center',
          background: `linear-gradient(135deg, ${P.gd}18, ${P.gd}08)`,
          border: `1px solid ${P.gd}40`, borderRadius: 12
        }}>
          <p style={{ fontSize: '1rem', color: P.tx, marginBottom: '1rem' }}>
            Découvre les 64 chapitres, les quiz, les histoires pour enfants et plus encore !
          </p>
          <a href={`/?ch=${ev.id}`} style={{
            display: 'inline-block', padding: '0.75rem 2rem',
            background: P.gd, color: '#fff', borderRadius: 8,
            textDecoration: 'none', fontWeight: 700, fontSize: '1rem'
          }}>
            Ouvrir dans Nûr As-Sîrah →
          </a>
        </div>

        {/* Prev / Next navigation */}
        <nav style={{
          display: 'flex', justifyContent: 'space-between', gap: '1rem',
          marginTop: '2rem', flexWrap: 'wrap'
        }}>
          {prevSeo ? (
            <a href={`/chapitre/${prevSeo.slug}`} style={{
              flex: 1, minWidth: 140, padding: '1rem', background: P.sf,
              border: `1px solid ${P.bd}`, borderRadius: 8,
              textDecoration: 'none', color: P.tx
            }}>
              <div style={{ fontSize: '0.8rem', color: P.ts }}>← Précédent</div>
              <div style={{ fontWeight: 600, marginTop: '0.25rem', fontSize: '0.9rem' }}>{prevSeo.title}</div>
            </a>
          ) : <div />}
          {nextSeo ? (
            <a href={`/chapitre/${nextSeo.slug}`} style={{
              flex: 1, minWidth: 140, padding: '1rem', background: P.sf,
              border: `1px solid ${P.bd}`, borderRadius: 8,
              textDecoration: 'none', color: P.tx, textAlign: 'right'
            }}>
              <div style={{ fontSize: '0.8rem', color: P.ts }}>Suivant →</div>
              <div style={{ fontWeight: 600, marginTop: '0.25rem', fontSize: '0.9rem' }}>{nextSeo.title}</div>
            </a>
          ) : <div />}
        </nav>
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center', padding: '2rem 1rem',
        borderTop: `1px solid ${P.bd}`, color: P.ts, fontSize: '0.85rem'
      }}>
        <p>Nûr As-Sîrah — La vie du Prophète Muhammad ﷺ</p>
        <p style={{ marginTop: '0.5rem' }}>Sadaqa Jâriya — Projet gratuit et open-source</p>
      </footer>
    </div>
  );
}
