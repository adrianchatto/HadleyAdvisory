# Hadley Advisors

Marketing site for Hadley Advisors with a small built-in CMS for editing copy, colours, and images.

## Stack

- Node.js (>= 18)
- Express + EJS templates
- File-backed CMS (`content/content.json`, `content/theme.json`)
- Session-based admin auth

## Local development

```bash
npm install
npm start
```

Then visit <http://localhost:3000>. The admin panel lives at `/admin/login`.

## Environment variables

| Variable         | Purpose                                        | Default (dev only)                    |
| ---------------- | ---------------------------------------------- | ------------------------------------- |
| `PORT`           | HTTP port                                      | `3000`                                |
| `ADMIN_USER`     | Admin username                                 | `admin`                               |
| `ADMIN_PASS`     | Admin password                                 | `admin`                               |
| `SESSION_SECRET` | Cookie signing secret                          | dev placeholder — **set in prod**     |
| `SITE_URL`       | Canonical site URL (used for absolute links)   | derived from request                  |

**Always override `ADMIN_USER`, `ADMIN_PASS`, and `SESSION_SECRET` in production.**

## Deploying to Render

The included `render.yaml` defines the web service. To deploy:

1. Push this repo to GitHub.
2. In Render, click **New → Blueprint** and point it at this repo.
3. When prompted, set `ADMIN_USER` and `ADMIN_PASS` (Render will auto-generate `SESSION_SECRET`).
4. Render will run `npm install` and `npm start`.

### Note on CMS persistence

Render's filesystem is **ephemeral** on the free / starter tiers — runtime edits via the CMS (and admin image uploads under `public/admin-assets/`) will be lost on every redeploy or restart. Options when you're ready:

- Attach a Render Persistent Disk and mount it at `content/` (and/or `public/admin-assets/`).
- Move CMS content into a managed Postgres / KV store.
- Treat the CMS as edit-then-commit (export changes back to git).

## Project layout

```
.
├── server.js              # Express app + CMS routes
├── views/                 # EJS templates (incl. admin)
├── public/                # Static assets (css/js/images)
├── content/
│   ├── content.json       # Site copy
│   └── theme.json         # Colour tokens
├── package.json
└── render.yaml            # Render blueprint
```
