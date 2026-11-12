# Cardi Nusantara — Official Web Portal (`cardinusantara.com`)

Production website for **Cardi Nusantara**, Indonesia's premier Go-To-Market (GTM) execution and brand growth partner.

## Tech Stack

- **Framework**: [Astro 5](https://astro.build/) (Static Site Generation / SSG)
- **Styling**: Vanilla CSS with custom properties (`src/styles/global.css`), fully responsive & mobile-first
- **i18n Localization**: Built-in Astro i18n supporting 3 languages:
  - Indonesian (Default, `id`): `/`
  - English (`en`): `/en/`
  - Chinese (`zh`): `/zh/`
- **Typography**: Plus Jakarta Sans, IBM Plex Mono

## Architecture & Structure

```
cardinus main/
├── public/
│   ├── assets/js/main.js    # Interactive Level Checker, Scrollytelling, client-side filtering
│   ├── logos/               # Vector & high-res official brand logos
│   └── favicon.*            # Multi-format favicon assets
├── src/
│   ├── components/
│   │   ├── EcoNav.astro     # Tier-1 Ecosystem micro-bar
│   │   ├── Navbar.astro     # Localized navigation bar with language switcher
│   │   └── Footer.astro     # Localized footer
│   ├── layouts/
│   │   └── BaseLayout.astro # Base HTML layout with SEO, OpenGraph, JSON-LD, localized floating WhatsApp CTA
│   └── pages/
│       ├── index.astro      # Indonesian landing page (default)
│       ├── en/index.astro   # English landing page
│       ├── zh/index.astro   # Chinese landing page
│       └── [slug].astro     # Dynamic content & blog pages
└── astro.config.mjs         # i18n and sitemap configuration
```

## Available Scripts

```bash
# Start development server
npm run dev

# Type check & build static production assets
npm run build

# Preview production build locally
npm run preview
```

## Key Guidelines

- **No Em Dashes**: Adheres to antislop rules; use colons, regular hyphens, or parentheses instead.
- **Accessibility**: Minimum 44px tap targets for all interactive controls.
- **WhatsApp Integration**: All CTAs open direct WhatsApp conversations with prefilled, localized message templates.

