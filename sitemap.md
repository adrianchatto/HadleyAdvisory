# Hadley Advisors — Site Map

A bird's-eye view of every page on the site, what edits each one, and how the URLs are structured. Useful for planning navigation, content updates, and what to ask the CMS to change.

## Public pages

| URL | Page | Source template | Content edited in |
|---|---|---|---|
| `/` | Home | `views/index.ejs` | Admin → Home |
| `/services` | Services | `views/services.ejs` | Admin → Services |
| `/about` | About | `views/about.ejs` | Admin → About |
| `/insights` | Insights (article index) | `views/insights.ejs` | Admin → Insights |
| `/insights/<slug>` | Individual article | `views/post.ejs` | Admin → Insights → Articles |
| `/contact` | Contact | `views/contact.ejs` | Admin → Contact |

The home page is split into these named sections (each editable separately in the admin):

- **Hero** — eyebrow, headline, closing word, subtitle, two CTAs, image
- **Hero meta items** — three short stat tiles
- **What we do** — four-card grid of service summaries
- **Why us** — four-tile grid explaining why accountancy firms choose Hadley
- **Approach** — four-step rhythm
- **Testimonials** — three quotes
- **Bottom CTA band** — closing call to action

Services is split into:

- **Page header** — eyebrow, title, lead
- **BD Support** — main pitch + two lists ("How we help", "Outcomes")
- **Fractional BD** — same shape, mirrored layout
- **Supporting services** — three-card grid
- **Approach** — six-step rhythm
- **Bottom CTA band**

About is split into:

- **Page header**
- **Founder** — bio paragraphs + photo
- **Philosophy** — five values
- **Belief** — closing statement
- **Bottom CTA band**

Insights is split into:

- **Page header**
- **Articles** — repeating list, each card → its own `/insights/<slug>` page with full markdown body
- **Bottom CTA band**

Contact is split into:

- **Page header**
- **Contact info block** — email, LinkedIn, location
- **Form** — captures locally; wire to Formspree/Netlify Forms before launch
- **Bottom CTA band**

## Article URLs

Each article in the admin has an auto-generated URL slug from its title. The current set of articles maps to:

- `/insights/why-salesy-is-the-wrong-fear-for-accountants`
- `/insights/the-conversation-that-quietly-costs-accountancy-firms-thousands`
- `/insights/building-a-bd-rhythm-partners-will-actually-keep`
- `/insights/the-client-experience-signals-partners-almost-always-miss`
- `/insights/what-separates-a-strong-proposal-from-a-forgettable-one`
- `/insights/the-four-numbers-every-accountancy-firm-should-track-weekly`

You can override any slug in the admin if you want a shorter URL.

## Admin pages (not for visitors)

| URL | Purpose |
|---|---|
| `/admin/login` | Login form (dev creds: `admin` / `admin`) |
| `/admin` | CMS dashboard — edit colours, copy, images |

## Machine-readable maps

| URL | Purpose |
|---|---|
| `/sitemap.xml` | Auto-generated sitemap for Google / Bing. Updates whenever you add or remove articles in the admin. Submit this URL in Google Search Console once the site is online. |
| `/robots.txt` | Tells crawlers which paths to skip (`/admin`, `/api`). Also points at `/sitemap.xml`. |

## API endpoints (used by the admin)

| Method + path | Purpose | Auth |
|---|---|---|
| `GET /api/content` | Read all editable copy | public |
| `POST /api/content` | Replace all editable copy | admin |
| `GET /api/theme` | Read brand colours | public |
| `POST /api/theme` | Replace brand colours | admin |
| `POST /api/upload` | Upload an image to `/public/assets/` | admin |
| `GET /css/theme.css` | Dynamic stylesheet built from `theme.json` | public |

## Useful files in the project

```
Hadley Advisory/
├── server.js              ← all routing
├── content/
│   ├── content.json       ← every editable string + image
│   └── theme.json         ← brand colours
├── views/                 ← EJS templates (one per page + partials)
└── public/
    ├── css/style.css      ← layout + motion
    ├── assets/            ← uploaded images live here
    └── admin-assets/      ← admin UI css + js
```
