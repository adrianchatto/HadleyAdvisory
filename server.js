/* ============================================================
   HADLEY ADVISORS — CMS SERVER
   Express server for the public site + small admin CMS.

   Routes:
     /                       (and /services, /about, /insights, /contact)
                             Public pages, rendered from EJS templates +
                             content.json.

     /css/theme.css          Dynamic CSS that injects brand colours from
                             theme.json into :root variables.

     /admin                  Admin dashboard (requires login).
     /admin/login            Login form.
     POST /admin/login       Validate credentials.
     POST /admin/logout      Clear session.

     GET  /api/content       Returns content.json.
     POST /api/content       Replaces content.json (auth required).
     GET  /api/theme         Returns theme.json.
     POST /api/theme         Replaces theme.json (auth required).
     POST /api/upload        Upload an image to /assets/ (auth required).

   This is dev-quality auth (admin/admin). Before going live, replace
   with a hashed password + HTTPS-only session cookies.
   ============================================================ */

const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');
const multer = require('multer');
const { marked } = require('marked');

// Configure marked: GitHub-flavoured, line breaks become <br>
marked.setOptions({ gfm: true, breaks: true });

const app = express();
const PORT = process.env.PORT || 3000;

const ROOT = __dirname;
const CONTENT_DIR = path.join(ROOT, 'content');
const CONTENT_FILE = path.join(CONTENT_DIR, 'content.json');
const THEME_FILE = path.join(CONTENT_DIR, 'theme.json');
const PUBLIC_DIR = path.join(ROOT, 'public');
const ASSETS_DIR = path.join(PUBLIC_DIR, 'assets');

// Dev credentials. Change these before going live.
const ADMIN_USER = process.env.ADMIN_USER || 'admin';
const ADMIN_PASS = process.env.ADMIN_PASS || 'admin';

// ---- View engine ---------------------------------------------------------
app.set('view engine', 'ejs');
app.set('views', path.join(ROOT, 'views'));

// ---- Middleware ----------------------------------------------------------
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'hadley-advisors-dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { httpOnly: true, sameSite: 'lax', maxAge: 1000 * 60 * 60 * 8 }
}));

// Serve /public statically (css, js, assets, /admin static files)
app.use(express.static(PUBLIC_DIR, { extensions: ['html'] }));

// ---- Helpers -------------------------------------------------------------
function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}
function writeJson(file, obj) {
  fs.writeFileSync(file, JSON.stringify(obj, null, 2) + '\n', 'utf8');
}
function requireAuth(req, res, next) {
  if (req.session && req.session.isAdmin) return next();
  if (req.path.startsWith('/api/')) return res.status(401).json({ error: 'Unauthorized' });
  return res.redirect('/admin/login');
}

// Slugify helper — turns "Why 'salesy' is the wrong fear" into "why-salesy-is-the-wrong-fear"
function slugify(s) {
  return String(s || '')
    .toLowerCase()
    .normalize('NFKD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Find a post by slug (uses explicit post.slug if set, otherwise auto-slug from title)
function findPostBySlug(content, slug) {
  const posts = (content && content.insights && content.insights.posts) || [];
  return posts.find(p => (p.slug ? slugify(p.slug) : slugify(p.title)) === slug);
}

// Make content + theme + helpers available to every EJS render
app.use((req, res, next) => {
  try {
    res.locals.content = readJson(CONTENT_FILE);
    res.locals.theme = readJson(THEME_FILE);
  } catch (err) {
    console.error('Failed to load content/theme:', err);
    res.locals.content = {};
    res.locals.theme = {};
  }
  res.locals.slugify = slugify;
  res.locals.markdown = (s) => marked.parse(String(s || ''));
  next();
});

// ---- Public pages --------------------------------------------------------
const PAGES = ['index', 'services', 'about', 'insights', 'contact'];
PAGES.forEach(name => {
  const route = name === 'index' ? '/' : `/${name}`;
  app.get(route, (req, res) => {
    res.render(name, { page: name });
  });
  // also support /index.html style paths from the old static site
  app.get(`/${name}.html`, (req, res) => res.redirect(301, route));
});

// Per-post insights page: /insights/<slug>
app.get('/insights/:slug', (req, res) => {
  const post = findPostBySlug(res.locals.content, req.params.slug);
  if (!post) return res.status(404).render('post', { page: 'insights', post: null, slug: req.params.slug });
  res.render('post', { page: 'insights', post, slug: req.params.slug });
});

// ---- SEO: sitemap.xml + robots.txt --------------------------------------
function getSiteUrl(req) {
  // Prefer explicit env, otherwise infer from request. Strip trailing slash.
  const fromEnv = process.env.SITE_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
  const host = req.headers['x-forwarded-host'] || req.headers.host;
  return `${proto}://${host}`.replace(/\/$/, '');
}

app.get('/sitemap.xml', (req, res) => {
  const base = getSiteUrl(req);
  const now = new Date().toISOString().slice(0, 10);
  const content = res.locals.content || {};
  const posts = (content.insights && content.insights.posts) || [];

  const urls = [
    { loc: `${base}/`, priority: '1.0' },
    { loc: `${base}/services`, priority: '0.9' },
    { loc: `${base}/about`, priority: '0.7' },
    { loc: `${base}/insights`, priority: '0.8' },
    { loc: `${base}/contact`, priority: '0.6' }
  ];

  posts.forEach(p => {
    const slug = p.slug ? slugify(p.slug) : slugify(p.title);
    if (!slug) return;
    // Skip posts that link to an external URL — those aren't ours to index
    if (p.url && p.url.trim() && p.url.trim() !== '#') return;
    urls.push({ loc: `${base}/insights/${slug}`, priority: '0.5' });
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;
  res.type('application/xml').set('Cache-Control', 'no-store').send(xml);
});

app.get('/robots.txt', (req, res) => {
  const base = getSiteUrl(req);
  const txt = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /admin-assets
Disallow: /api

Sitemap: ${base}/sitemap.xml
`;
  res.type('text/plain').set('Cache-Control', 'no-store').send(txt);
});

// ---- Dynamic theme stylesheet -------------------------------------------
app.get('/css/theme.css', (req, res) => {
  let theme;
  try { theme = readJson(THEME_FILE); } catch { theme = {}; }
  const v = (k, fallback) => theme[k] || fallback;
  const css = `:root {
  --color-primary: ${v('colorPrimary', '#0f2a44')};
  --color-primary-dark: ${v('colorPrimaryDark', '#0a1d31')};
  --color-accent: ${v('colorAccent', '#c9a968')};
  --color-accent-dark: ${v('colorAccentDark', '#b08f4d')};
  --color-bg: ${v('colorBg', '#faf8f5')};
  --color-surface: ${v('colorSurface', '#ffffff')};
  --color-surface-alt: ${v('colorSurfaceAlt', '#f3efe8')};
  --color-text: ${v('colorText', '#1a2332')};
  --color-text-muted: ${v('colorTextMuted', '#5a6b7d')};
  --color-text-on-dark: ${v('colorTextOnDark', '#f5f1e8')};
  --color-border: ${v('colorBorder', '#e5e1d8')};
}`;
  res.type('text/css').set('Cache-Control', 'no-store').send(css);
});

// ---- Admin: login --------------------------------------------------------
app.get('/admin/login', (req, res) => {
  if (req.session && req.session.isAdmin) return res.redirect('/admin');
  const error = req.query.error ? 'Incorrect username or password.' : '';
  res.render('admin-login', { error, page: 'admin-login' });
});

app.post('/admin/login', (req, res) => {
  const { username, password } = req.body || {};
  if (username === ADMIN_USER && password === ADMIN_PASS) {
    req.session.isAdmin = true;
    return res.redirect('/admin');
  }
  return res.redirect('/admin/login?error=1');
});

app.post('/admin/logout', (req, res) => {
  req.session.destroy(() => res.redirect('/admin/login'));
});

// ---- Admin: dashboard ----------------------------------------------------
app.get('/admin', requireAuth, (req, res) => {
  res.render('admin-dashboard', { page: 'admin' });
});

// ---- API: content / theme ------------------------------------------------
app.get('/api/content', (req, res) => {
  try { res.json(readJson(CONTENT_FILE)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/content', requireAuth, (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Body must be a JSON object' });
  }
  try {
    writeJson(CONTENT_FILE, req.body);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/theme', (req, res) => {
  try { res.json(readJson(THEME_FILE)); }
  catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/theme', requireAuth, (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    return res.status(400).json({ error: 'Body must be a JSON object' });
  }
  try {
    writeJson(THEME_FILE, req.body);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ---- API: image upload ---------------------------------------------------
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      fs.mkdirSync(ASSETS_DIR, { recursive: true });
      cb(null, ASSETS_DIR);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const base = path.basename(file.originalname, ext)
        .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'image';
      const stamp = Date.now().toString(36);
      cb(null, `${base}-${stamp}${ext}`);
    }
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /^image\/(png|jpe?g|gif|webp|svg\+xml)$/.test(file.mimetype);
    cb(ok ? null : new Error('Only image files are allowed'), ok);
  }
});

app.post('/api/upload', requireAuth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
  const url = `/assets/${req.file.filename}`;
  res.json({ ok: true, url, name: req.file.filename });
});

// Multer error handler (must come after routes that use it)
app.use((err, req, res, next) => {
  if (err) {
    console.error(err);
    return res.status(400).json({ error: err.message });
  }
  next();
});

// ---- 404 ----------------------------------------------------------------
app.use((req, res) => {
  res.status(404).send('<!doctype html><title>Not found</title><h1>404 — Not found</h1><p><a href="/">Back to home</a></p>');
});

// ---- Boot ---------------------------------------------------------------
app.listen(PORT, () => {
  console.log(`Hadley Advisors site running at http://localhost:${PORT}`);
  console.log(`Admin login: http://localhost:${PORT}/admin/login  (admin / admin)`);
});
