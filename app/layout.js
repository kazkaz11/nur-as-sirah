import './globals.css'

export const metadata = {
  title: 'Nûr As-Sîrah — La vie du Prophète Muhammad ﷺ',
  description: 'Découvrez la vie du Prophète Muhammad ﷺ de manière interactive : 64 événements, quiz, flashcards, histoires pour enfants, arbre généalogique.',
  keywords: 'sîrah, prophète muhammad, islam, vie du prophète, sirah, coran, histoire islamique',
  openGraph: {
    title: 'Nûr As-Sîrah — La vie du Prophète Muhammad ﷺ',
    description: 'La Sîrah du Prophète ﷺ racontée de manière immersive, éducative et accessible.',
    url: 'https://sirahduprophete.fr',
    siteName: 'Nûr As-Sîrah',
    locale: 'fr_FR',
    type: 'website',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <head>
        {/* Google Search Console - remplace TON_CODE par ton code de vérification */}
        {/* <meta name="google-site-verification" content="TON_CODE_ICI" /> */}
        
        {/* Plausible Analytics - décommente quand tu es prêt */}
        {/* <script defer data-domain="sirahduprophete.fr" src="https://plausible.io/js/script.js"></script> */}
      </head>
      <body>{children}</body>
    </html>
  )
}
