# Hadley Advisors — How to run this site

Quick reference for Ch@o (and for any future Claude session that needs to pick this up).

## What this is

Marketing website for **Hadley Advisors** — Ch@o's wife's business: business-development advisory and fractional BD leadership for accountancy firms. Cinematic visual treatment: full-bleed photographic hero, modern serif headlines (Fraunces), clean spaced sections.

Built as a small Node.js + Express + EJS app with a built-in CMS so non-developers can edit copy, brand colours and images without touching code.

## Daily use — running the site

Open Terminal:

```bash
cd "/Users/Ays/Documents/Claude/Projects/Hadley Advisory"
npm start
```

Then visit:

- Site: http://localhost:3000
- Admin: http://localhost:3000/admin/login (login: `admin` / `admin`)

To stop: `Ctrl+C` in the same Terminal.

## How to edit the site (admin)

Sign into http://localhost:3000/admin/login. The dashboard has tabs:

- **Brand colours** — eleven colour pickers; saved colours apply site-wide immediately
- **Site → Global** — brand wordmark, footer tagline, contact email, LinkedIn URL
- **Home / Services / About / Insights / Contact** — every editable string and image, organised section by section

The home **hero image** is the full-bleed photograph behind the headline. Change it under Admin → Home → Hero → Hero image (upload a file or paste a URL).

Articles in the Insights tab support markdown bodies. Each one auto-publishes at `/insights/<slug>` with a per-post URL.

## Project structure

```
Hadley Advisory/
├── server.js              ← Express server + routing
├── package.json           ← npm scripts
├── content/
│   ├── content.json       ← Every editable string + image
│   └── theme.json         ← Brand colours
├── views/
│   ├── index.ejs / services.ejs / about.ejs / insights.ejs / contact.ejs
│   ├── post.ejs           ← Individual article page
│   ├── admin-login.ejs / admin-dashboard.ejs
│   └── partials/          ← Shared head + footer
└── public/
    ├── css/style.css      ← Main stylesheet (cinematic)
    ├── js/script.js       ← Mobile nav, scroll reveals, contact form
    ├── assets/            ← favicon + uploaded images
    └── admin-assets/      ← Admin UI css + js
```

## Useful URLs (when running)

| URL | Purpose |
|---|---|
| `/` | Home page |
| `/services`, `/about`, `/insights`, `/contact` | Inner pages |
| `/insights/<slug>` | Individual article |
| `/admin` | CMS dashboard |
| `/sitemap.xml` | SEO sitemap (auto-generated, includes all articles) |
| `/robots.txt` | Crawler rules |

## Going-live checklist

- Change `ADMIN_USER` / `ADMIN_PASS` / `SESSION_SECRET` env vars (currently `admin/admin` for dev)
- Wire the contact form to a real handler (Formspree, Netlify Forms, etc.) — currently captures locally only
- Set `SITE_URL=https://hadleyadvisors.com` env var so sitemap.xml uses the production domain
- Add proper TLS / HTTPS — Microsoft 365 email is already wired to `hadleyadvisors.com` (DNSSEC sorted, nameservers point to Microsoft)
- Pick a host: see hosting notes in conversation history (Cloud Run, Render, Railway are all good options)

## Quick troubleshooting

- **`npm: command not found`** → install Node from https://nodejs.org (LTS), quit and reopen Terminal, retry.
- **`Cannot find module …`** → run `npm install` once in the project folder.
- **Server-side change not visible** → Node doesn't auto-reload. `Ctrl+C` then `npm start` again.
- **Content change not visible** → just refresh the browser (content.json is re-read on every request).
- **Port already in use** → another server is still running. `lsof -i :3000` to find it, `kill <pid>` to stop it.
