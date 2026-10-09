# 🕌 Nûr As-Sîrah — La vie du Prophète Muhammad ﷺ

## 📁 Structure du projet

```
nur-as-sirah/
├── app/
│   ├── layout.js          ← Meta SEO + analytics
│   ├── page.js            ← Page principale
│   └── globals.css        ← Styles de base
├── components/
│   └── SirahApp.jsx       ← L'app complète (75KB)
├── data/
│   ├── events.js          ← 64 événements (145KB)
│   ├── companions.js      ← 36 biographies (25KB)
│   ├── kids.js            ← 20 histoires enfants (43KB)
│   ├── quizzes.js         ← Quiz + flashcards (27KB)
│   ├── themes.js          ← 8 parcours + périodes (1KB)
│   └── seo.js             ← Slugs SEO (5KB)
├── package.json
├── next.config.js
└── README.md
```

## 🚀 Mettre en ligne (5 minutes)

### Étape 1 — Crée un compte GitHub (gratuit)
1. Va sur https://github.com
2. Crée un compte
3. Crée un nouveau repository : "nur-as-sirah"
4. Upload TOUS les fichiers de ce dossier

### Étape 2 — Connecte Vercel (gratuit)
1. Va sur https://vercel.com
2. Connecte ton compte GitHub
3. Clique "Import Project"
4. Sélectionne "nur-as-sirah"
5. Clique "Deploy"
6. En 1 minute ton site est live sur une URL vercel.app !

### Étape 3 — Connecte ton domaine
1. Dans Vercel → Settings → Domains
2. Tape : sirahduprophete.fr
3. Vercel te donne les DNS à configurer chez ton registrar
4. HTTPS automatique

## ✏️ Modifier le contenu

### Changer un texte :
1. Ouvre `data/events.js` sur GitHub
2. Clique l'icône crayon (Edit)
3. Modifie le texte
4. Clique "Commit changes"
5. Le site se met à jour en 30 secondes

### Ajouter un fun fact :
Même chose — trouve l'événement dans `data/events.js`, ajoute `fun:"ton texte"`.

### Ajouter une histoire enfant :
Ouvre `data/kids.js`, ajoute un nouveau bloc à la fin du tableau.

## 📊 Analytics

### Google Search Console (obligatoire) :
1. Va sur https://search.google.com/search-console
2. Ajoute sirahduprophete.fr
3. Copie le code de vérification
4. Colle-le dans `app/layout.js` (remplace TON_CODE_ICI)
5. Soumets le sitemap : sirahduprophete.fr/sitemap.xml

### Plausible (optionnel, 9€/mois) :
1. Crée un compte sur https://plausible.io
2. Décommente la ligne Plausible dans `app/layout.js`
