/* ============================================================
   HADLEY ADVISORS — ADMIN CMS CLIENT
   Loads /api/content + /api/theme, generates forms based on a
   schema, lets the user edit text / colours / images, and POSTs
   the changes back. The schema below mirrors the shape of
   content.json — adding new fields here lights them up in the UI.
   ============================================================ */

(() => {
  'use strict';

  // ---- Schema ---------------------------------------------------------
  // Each tab is a section of the dashboard. Fields can be:
  //   { key, label, type: 'text' | 'textarea' | 'image' | 'list' | 'object-list' }
  //   For 'object-list', `fields` is the per-item field schema and
  //   `itemLabel` builds the card heading from the item.
  //   For 'list', items are simple strings.
  //
  // Top-level "path" is the dot-path into the content JSON.

  const TAB_GROUPS = [
    {
      group: 'Theme',
      tabs: [
        { id: 'theme', label: 'Brand colours', store: 'theme', kind: 'theme' }
      ]
    },
    {
      group: 'Site',
      tabs: [
        {
          id: 'site', label: 'Global', store: 'content', path: 'site',
          fields: [
            { key: 'brandFirst', label: 'Brand — first part', type: 'text' },
            { key: 'brandMark', label: 'Brand — mark', type: 'text', hint: 'The accent character between the two words (default ".").' },
            { key: 'brandSecond', label: 'Brand — second part', type: 'text' },
            { key: 'navCta', label: 'Header CTA label', type: 'text' },
            { key: 'footerTagline', label: 'Footer tagline', type: 'textarea' },
            { key: 'footerCopyright', label: 'Footer copyright line', type: 'text' },
            { key: 'email', label: 'Contact email', type: 'text' },
            { key: 'linkedinUrl', label: 'LinkedIn URL', type: 'text' },
            { key: 'linkedinLabel', label: 'LinkedIn label', type: 'text' }
          ]
        }
      ]
    },
    {
      group: 'Pages',
      tabs: [
        {
          id: 'home', label: 'Home', store: 'content', path: 'home',
          sections: [
            {
              title: 'Page meta',
              fields: [
                { key: 'metaTitle', label: 'Browser title', type: 'text' },
                { key: 'metaDescription', label: 'Meta description', type: 'textarea' }
              ]
            },
            {
              title: 'Hero',
              path: 'hero',
              fields: [
                { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
                { key: 'titleStart', label: 'Headline — start', type: 'text' },
                { key: 'rotateWords', label: 'Closing word', type: 'text', hint: 'The final word of the headline (e.g. "confidence" or "integrity"). Plain text — no rotation, no highlight.' },
                { key: 'titleEnd', label: 'Headline — end punctuation', type: 'text' },
                { key: 'subtitle', label: 'Subtitle', type: 'textarea' },
                { key: 'ctaPrimary', label: 'Primary CTA label', type: 'text' },
                { key: 'ctaSecondary', label: 'Secondary CTA label', type: 'text' },
                { key: 'image', label: 'Hero image', type: 'image' },
                { key: 'imageAlt', label: 'Hero image alt text', type: 'text' }
              ]
            },
            {
              title: 'Hero meta items', path: 'metaItems', kind: 'object-list',
              itemFields: [
                { key: 'num', label: 'Headline value', type: 'text' },
                { key: 'label', label: 'Caption', type: 'text' }
              ],
              itemLabel: (i, item) => item.num || `Item ${i + 1}`,
              minItems: 0, addLabel: 'Add stat'
            },
            {
              title: 'What we do',
              path: 'whatWeDo',
              fields: [
                { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
                { key: 'title', label: 'Section title', type: 'text' },
                { key: 'lead', label: 'Lead paragraph', type: 'textarea' }
              ]
            },
            {
              title: 'What we do — cards', path: 'whatWeDo.cards', kind: 'object-list',
              itemFields: [
                { key: 'num', label: 'Number label (e.g. "01")', type: 'text' },
                { key: 'title', label: 'Card title', type: 'text' },
                { key: 'body', label: 'Card body', type: 'textarea' }
              ],
              itemLabel: (i, item) => `${item.num || i + 1} — ${item.title || 'Card'}`,
              addLabel: 'Add card'
            },
            {
              title: 'Why us',
              path: 'whyUs',
              fields: [
                { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
                { key: 'title', label: 'Section title', type: 'text' },
                { key: 'lead', label: 'Lead paragraph', type: 'textarea' }
              ]
            },
            {
              title: 'Why us — items', path: 'whyUs.items', kind: 'object-list',
              itemFields: [
                { key: 'title', label: 'Title', type: 'text' },
                { key: 'body', label: 'Body', type: 'textarea' }
              ],
              itemLabel: (i, item) => item.title || `Item ${i + 1}`,
              addLabel: 'Add reason'
            },
            {
              title: 'Approach',
              path: 'approach',
              fields: [
                { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
                { key: 'title', label: 'Section title', type: 'text' },
                { key: 'lead', label: 'Lead paragraph', type: 'textarea' }
              ]
            },
            {
              title: 'Approach — steps', path: 'approach.steps', kind: 'object-list',
              itemFields: [
                { key: 'title', label: 'Step title', type: 'text' },
                { key: 'body', label: 'Step body', type: 'textarea' }
              ],
              itemLabel: (i, item) => `${i + 1}. ${item.title || 'Step'}`,
              addLabel: 'Add step'
            },
            {
              title: 'Testimonials header',
              path: 'testimonialsHeader',
              fields: [
                { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
                { key: 'title', label: 'Section title', type: 'text' }
              ]
            },
            {
              title: 'Testimonials', path: 'testimonials', kind: 'object-list',
              itemFields: [
                { key: 'quote', label: 'Quote', type: 'textarea' },
                { key: 'name', label: 'Name', type: 'text' },
                { key: 'role', label: 'Role', type: 'text' }
              ],
              itemLabel: (i, item) => item.name || `Testimonial ${i + 1}`,
              addLabel: 'Add testimonial'
            },
            {
              title: 'Bottom CTA band',
              path: 'ctaBand',
              fields: [
                { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
                { key: 'title', label: 'CTA title', type: 'text' },
                { key: 'body', label: 'CTA body', type: 'textarea' },
                { key: 'ctaPrimary', label: 'Primary CTA label', type: 'text' },
                { key: 'ctaSecondary', label: 'Secondary CTA label', type: 'text' }
              ]
            }
          ]
        },
        {
          id: 'services', label: 'Services', store: 'content', path: 'services',
          sections: [
            {
              title: 'Page meta',
              fields: [
                { key: 'metaTitle', label: 'Browser title', type: 'text' },
                { key: 'metaDescription', label: 'Meta description', type: 'textarea' }
              ]
            },
            {
              title: 'Page header', path: 'header',
              fields: [
                { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
                { key: 'title', label: 'Title', type: 'text' },
                { key: 'lead', label: 'Lead', type: 'textarea' }
              ]
            },
            {
              title: 'BD support — main',
              path: 'bdSupport',
              fields: [
                { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
                { key: 'title', label: 'Title', type: 'textarea' },
                { key: 'body', label: 'Body', type: 'textarea' },
                { key: 'cta', label: 'CTA label', type: 'text' }
              ]
            },
            {
              title: 'BD support — How we help', path: 'bdSupport.howWeHelp', kind: 'object-list',
              itemFields: [
                { key: 'title', label: 'Title', type: 'text' },
                { key: 'body', label: 'Body', type: 'textarea' }
              ],
              itemLabel: (i, item) => item.title || `Item ${i + 1}`,
              addLabel: 'Add item'
            },
            {
              title: 'BD support — Outcomes', path: 'bdSupport.outcomes', kind: 'list',
              addLabel: 'Add outcome'
            },
            {
              title: 'Fractional BD — main',
              path: 'fractional',
              fields: [
                { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
                { key: 'title', label: 'Title', type: 'textarea' },
                { key: 'body', label: 'Body', type: 'textarea' },
                { key: 'bodyMuted', label: 'Body (secondary, muted)', type: 'textarea' },
                { key: 'cta', label: 'CTA label', type: 'text' }
              ]
            },
            {
              title: 'Fractional BD — How we help', path: 'fractional.howWeHelp', kind: 'object-list',
              itemFields: [
                { key: 'title', label: 'Title', type: 'text' },
                { key: 'body', label: 'Body', type: 'textarea' }
              ],
              itemLabel: (i, item) => item.title || `Item ${i + 1}`,
              addLabel: 'Add item'
            },
            {
              title: 'Fractional BD — Outcomes', path: 'fractional.outcomes', kind: 'list',
              addLabel: 'Add outcome'
            },
            {
              title: 'Supporting services — header',
              path: 'supporting',
              fields: [
                { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
                { key: 'title', label: 'Title', type: 'text' },
                { key: 'lead', label: 'Lead', type: 'textarea' }
              ]
            },
            {
              title: 'Supporting services — cards', path: 'supporting.cards', kind: 'object-list',
              itemFields: [
                { key: 'title', label: 'Title', type: 'text' },
                { key: 'body', label: 'Body', type: 'textarea' }
              ],
              itemLabel: (i, item) => item.title || `Card ${i + 1}`,
              addLabel: 'Add supporting service'
            },
            {
              title: 'Approach', path: 'approach',
              fields: [
                { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
                { key: 'title', label: 'Title', type: 'text' },
                { key: 'lead', label: 'Lead', type: 'textarea' }
              ]
            },
            {
              title: 'Approach — steps', path: 'approach.steps', kind: 'object-list',
              itemFields: [
                { key: 'title', label: 'Title', type: 'text' },
                { key: 'body', label: 'Body', type: 'textarea' }
              ],
              itemLabel: (i, item) => `${i + 1}. ${item.title || 'Step'}`,
              addLabel: 'Add step'
            },
            {
              title: 'Bottom CTA band', path: 'ctaBand',
              fields: [
                { key: 'title', label: 'Title', type: 'text' },
                { key: 'body', label: 'Body', type: 'textarea' },
                { key: 'cta', label: 'CTA label', type: 'text' }
              ]
            }
          ]
        },
        {
          id: 'about', label: 'About', store: 'content', path: 'about',
          sections: [
            {
              title: 'Page meta',
              fields: [
                { key: 'metaTitle', label: 'Browser title', type: 'text' },
                { key: 'metaDescription', label: 'Meta description', type: 'textarea' }
              ]
            },
            {
              title: 'Page header', path: 'header',
              fields: [
                { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
                { key: 'title', label: 'Title', type: 'text' },
                { key: 'lead', label: 'Lead', type: 'textarea' }
              ]
            },
            {
              title: 'Founder', path: 'founder',
              fields: [
                { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
                { key: 'name', label: 'Name', type: 'text' },
                { key: 'paragraph1', label: 'Paragraph 1', type: 'textarea' },
                { key: 'paragraph2', label: 'Paragraph 2', type: 'textarea' },
                { key: 'paragraph3', label: 'Paragraph 3', type: 'textarea' },
                { key: 'ctaLabel', label: 'CTA label', type: 'text' },
                { key: 'photo', label: 'Founder photo', type: 'image' }
              ]
            },
            {
              title: 'Philosophy', path: 'philosophy',
              fields: [
                { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
                { key: 'title', label: 'Title', type: 'text' },
                { key: 'lead', label: 'Lead', type: 'textarea' }
              ]
            },
            {
              title: 'Philosophy — values', path: 'philosophy.values', kind: 'object-list',
              itemFields: [
                { key: 'title', label: 'Title', type: 'text' },
                { key: 'body', label: 'Body', type: 'textarea' }
              ],
              itemLabel: (i, item) => item.title || `Value ${i + 1}`,
              addLabel: 'Add value'
            },
            {
              title: 'Belief', path: 'belief',
              fields: [
                { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
                { key: 'title', label: 'Title', type: 'textarea' },
                { key: 'lead', label: 'Lead', type: 'textarea' }
              ]
            },
            {
              title: 'Bottom CTA band', path: 'ctaBand',
              fields: [
                { key: 'title', label: 'Title', type: 'text' },
                { key: 'body', label: 'Body', type: 'textarea' },
                { key: 'ctaPrimary', label: 'Primary CTA label', type: 'text' },
                { key: 'ctaSecondary', label: 'Secondary CTA label', type: 'text' }
              ]
            }
          ]
        },
        {
          id: 'insights', label: 'Insights', store: 'content', path: 'insights',
          sections: [
            {
              title: 'Page meta',
              fields: [
                { key: 'metaTitle', label: 'Browser title', type: 'text' },
                { key: 'metaDescription', label: 'Meta description', type: 'textarea' }
              ]
            },
            {
              title: 'Page header', path: 'header',
              fields: [
                { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
                { key: 'title', label: 'Title', type: 'text' },
                { key: 'lead', label: 'Lead', type: 'textarea' }
              ]
            },
            {
              title: 'Articles', path: 'posts', kind: 'object-list',
              itemFields: [
                { key: 'category', label: 'Category', type: 'text' },
                { key: 'readTime', label: 'Read time', type: 'text' },
                { key: 'title', label: 'Title', type: 'text' },
                { key: 'slug', label: 'URL slug', type: 'text', hint: 'Optional. Becomes /insights/<slug>. Leave blank to auto-generate from the title.' },
                { key: 'body', label: 'Excerpt (shown on Insights page card)', type: 'textarea' },
                { key: 'content', label: 'Article body (markdown supported)', type: 'textarea', hint: 'The full article. Use blank lines between paragraphs. Markdown supported: **bold**, *italic*, ## Heading, - bullet, [link](url).' },
                { key: 'image', label: 'Article image', type: 'image' },
                { key: 'url', label: 'External URL (optional)', type: 'text', hint: 'Only set this if the article lives elsewhere (e.g. LinkedIn, Substack). Leave blank for an article hosted on this site.' }
              ],
              itemLabel: (i, item) => item.title || `Post ${i + 1}`,
              addLabel: 'Add article'
            },
            {
              title: 'Bottom CTA band', path: 'ctaBand',
              fields: [
                { key: 'title', label: 'Title', type: 'text' },
                { key: 'body', label: 'Body', type: 'textarea' },
                { key: 'ctaPrimary', label: 'Primary CTA label', type: 'text' },
                { key: 'ctaSecondary', label: 'Secondary CTA label', type: 'text' }
              ]
            }
          ]
        },
        {
          id: 'contact', label: 'Contact', store: 'content', path: 'contact',
          sections: [
            {
              title: 'Page meta',
              fields: [
                { key: 'metaTitle', label: 'Browser title', type: 'text' },
                { key: 'metaDescription', label: 'Meta description', type: 'textarea' }
              ]
            },
            {
              title: 'Page header', path: 'header',
              fields: [
                { key: 'eyebrow', label: 'Eyebrow', type: 'text' },
                { key: 'title', label: 'Title', type: 'text' },
                { key: 'lead', label: 'Lead', type: 'textarea' }
              ]
            },
            {
              title: 'Contact info', path: 'info',
              fields: [
                { key: 'title', label: 'Section title', type: 'text' },
                { key: 'body', label: 'Section body', type: 'textarea' },
                { key: 'linkedinHandle', label: 'LinkedIn handle (display)', type: 'text' },
                { key: 'basedIn', label: 'Based in', type: 'text' },
                { key: 'workingWith', label: 'Working with firms across', type: 'text' }
              ]
            },
            {
              title: 'Bottom CTA band', path: 'ctaBand',
              fields: [
                { key: 'title', label: 'Title', type: 'text' },
                { key: 'body', label: 'Body', type: 'textarea' },
                { key: 'ctaPrimary', label: 'Primary CTA label', type: 'text' },
                { key: 'ctaSecondary', label: 'Secondary CTA label', type: 'text' }
              ]
            }
          ]
        }
      ]
    }
  ];

  const COLOR_FIELDS = [
    { key: 'colorPrimary', label: 'Primary (navy / brand)' },
    { key: 'colorPrimaryDark', label: 'Primary — dark (hover)' },
    { key: 'colorAccent', label: 'Accent (gold)' },
    { key: 'colorAccentDark', label: 'Accent — dark (hover)' },
    { key: 'colorBg', label: 'Page background' },
    { key: 'colorSurface', label: 'Surface (cards)' },
    { key: 'colorSurfaceAlt', label: 'Surface — alternate (sections)' },
    { key: 'colorText', label: 'Body text' },
    { key: 'colorTextMuted', label: 'Body text — muted' },
    { key: 'colorTextOnDark', label: 'Text on dark backgrounds' },
    { key: 'colorBorder', label: 'Border / divider' }
  ];

  // ---- State ----------------------------------------------------------
  let content = null;
  let theme = null;
  let currentTabId = null;

  // ---- Utility: get/set by dot-path ----------------------------------
  function getPath(obj, path) {
    if (!path) return obj;
    return path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
  }
  function setPath(obj, path, value) {
    if (!path) return;
    const parts = path.split('.');
    const last = parts.pop();
    let cur = obj;
    for (const p of parts) {
      if (cur[p] == null || typeof cur[p] !== 'object') cur[p] = {};
      cur = cur[p];
    }
    cur[last] = value;
  }

  // ---- Toast ----------------------------------------------------------
  let toastTimer = null;
  function toast(message, kind) {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.className = 'admin-toast is-show' + (kind ? ' admin-toast--' + kind : '');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('is-show'), 2400);
  }

  // ---- Field renderers ------------------------------------------------
  function el(tag, attrs = {}, children = []) {
    const node = document.createElement(tag);
    for (const k in attrs) {
      if (k === 'class') node.className = attrs[k];
      else if (k === 'html') node.innerHTML = attrs[k];
      else if (k.startsWith('on') && typeof attrs[k] === 'function') node.addEventListener(k.slice(2).toLowerCase(), attrs[k]);
      else node.setAttribute(k, attrs[k]);
    }
    (Array.isArray(children) ? children : [children]).forEach(c => {
      if (c == null) return;
      node.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return node;
  }

  function renderTextField(parent, field, getValue, setValue) {
    const id = 'f-' + Math.random().toString(36).slice(2);
    const wrap = el('div', { class: 'field' });
    wrap.appendChild(el('label', { for: id, class: 'field__label' }, field.label));
    if (field.hint) wrap.appendChild(el('div', { class: 'field__hint' }, field.hint));
    let input;
    if (field.type === 'textarea') {
      input = el('textarea', { id });
      input.value = getValue() || '';
      // Article-body fields and other big-prose fields get a taller box
      if (/article body|markdown|content/i.test(field.label || '')) {
        input.style.minHeight = '320px';
        input.style.fontFamily = 'inherit';
        input.style.lineHeight = '1.6';
      }
    } else {
      input = el('input', { id, type: 'text' });
      input.value = getValue() || '';
    }
    input.addEventListener('input', () => setValue(input.value));
    wrap.appendChild(input);
    parent.appendChild(wrap);
  }

  function renderImageField(parent, field, getValue, setValue) {
    const wrap = el('div', { class: 'field' });
    wrap.appendChild(el('label', { class: 'field__label' }, field.label));

    const grid = el('div', { class: 'image-field' });
    const preview = el('div', { class: 'image-field__preview' });
    const refreshPreview = () => {
      const v = getValue();
      preview.innerHTML = '';
      if (v) {
        const img = el('img', { src: v, alt: '' });
        preview.appendChild(img);
      } else {
        preview.appendChild(el('span', {}, 'No image'));
      }
    };
    refreshPreview();

    const controls = el('div', { class: 'image-field__controls' });
    const urlInput = el('input', { type: 'text', placeholder: '/assets/image.jpg or full URL' });
    urlInput.value = getValue() || '';
    urlInput.addEventListener('input', () => {
      setValue(urlInput.value);
      refreshPreview();
    });

    const fileInput = el('input', { type: 'file', accept: 'image/*' });
    const uploadBtn = el('button', { type: 'button', class: 'btn btn--ghost btn--small' }, 'Upload from computer');
    uploadBtn.addEventListener('click', () => fileInput.click());

    fileInput.addEventListener('change', async (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      uploadBtn.disabled = true;
      uploadBtn.textContent = 'Uploading…';
      try {
        const fd = new FormData();
        fd.append('image', f);
        const res = await fetch('/api/upload', { method: 'POST', body: fd });
        if (!res.ok) throw new Error((await res.json()).error || 'Upload failed');
        const data = await res.json();
        urlInput.value = data.url;
        setValue(data.url);
        refreshPreview();
        toast('Image uploaded', 'success');
      } catch (err) {
        toast(err.message || 'Upload failed', 'error');
      } finally {
        uploadBtn.disabled = false;
        uploadBtn.textContent = 'Upload from computer';
        fileInput.value = '';
      }
    });

    const clearBtn = el('button', { type: 'button', class: 'btn btn--ghost btn--small' }, 'Clear');
    clearBtn.addEventListener('click', () => {
      urlInput.value = '';
      setValue('');
      refreshPreview();
    });

    const row = el('div', { class: 'image-field__upload-row' }, [uploadBtn, clearBtn, fileInput]);
    controls.appendChild(urlInput);
    controls.appendChild(row);

    grid.appendChild(preview);
    grid.appendChild(controls);
    wrap.appendChild(grid);
    parent.appendChild(wrap);
  }

  function renderObjectFields(parent, fields, getRoot, basePath) {
    fields.forEach(field => {
      const fullPath = basePath ? `${basePath}.${field.key}` : field.key;
      const get = () => getPath(getRoot(), fullPath);
      const set = (v) => setPath(getRoot(), fullPath, v);
      if (field.type === 'image') renderImageField(parent, field, get, set);
      else renderTextField(parent, field, get, set);
    });
  }

  function renderObjectList(parent, section, getRoot) {
    const block = el('div', { class: 'array-block' });
    const list = el('div', { class: 'array-block__items' });

    function rerender() {
      list.innerHTML = '';
      const arr = getPath(getRoot(), section.path) || [];
      if (!Array.isArray(arr)) return;

      arr.forEach((_, idx) => {
        const card = el('div', { class: 'card-block' });
        const title = section.itemLabel ? section.itemLabel(idx, arr[idx]) : `Item ${idx + 1}`;
        const head = el('div', { class: 'card-block__header' }, [
          el('span', { class: 'card-block__title' }, title)
        ]);
        const actions = el('div', { class: 'card-block__actions' });
        const upBtn = el('button', { type: 'button', class: 'btn btn--ghost btn--small' }, '↑');
        upBtn.disabled = idx === 0;
        upBtn.addEventListener('click', () => {
          const a = getPath(getRoot(), section.path);
          [a[idx - 1], a[idx]] = [a[idx], a[idx - 1]];
          rerender();
        });
        const downBtn = el('button', { type: 'button', class: 'btn btn--ghost btn--small' }, '↓');
        downBtn.disabled = idx === arr.length - 1;
        downBtn.addEventListener('click', () => {
          const a = getPath(getRoot(), section.path);
          [a[idx + 1], a[idx]] = [a[idx], a[idx + 1]];
          rerender();
        });
        const delBtn = el('button', { type: 'button', class: 'btn btn--danger btn--small' }, 'Remove');
        delBtn.addEventListener('click', () => {
          const a = getPath(getRoot(), section.path);
          a.splice(idx, 1);
          rerender();
        });
        actions.appendChild(upBtn);
        actions.appendChild(downBtn);
        actions.appendChild(delBtn);
        head.appendChild(actions);
        card.appendChild(head);

        renderObjectFields(card, section.itemFields, getRoot, `${section.path}.${idx}`);
        list.appendChild(card);
      });
    }

    rerender();
    block.appendChild(list);

    const addBtn = el('button', { type: 'button', class: 'btn btn--ghost btn--small array-block__add' }, '+ ' + (section.addLabel || 'Add item'));
    addBtn.addEventListener('click', () => {
      const a = getPath(getRoot(), section.path);
      const blank = {};
      section.itemFields.forEach(f => { blank[f.key] = ''; });
      a.push(blank);
      rerender();
    });
    block.appendChild(addBtn);
    parent.appendChild(block);
  }

  function renderStringList(parent, section, getRoot) {
    const block = el('div', { class: 'array-block' });
    const list = el('div', { class: 'array-block__items' });

    function rerender() {
      list.innerHTML = '';
      const arr = getPath(getRoot(), section.path) || [];
      arr.forEach((_, idx) => {
        const card = el('div', { class: 'card-block' });
        const head = el('div', { class: 'card-block__header' }, [
          el('span', { class: 'card-block__title' }, `Item ${idx + 1}`)
        ]);
        const actions = el('div', { class: 'card-block__actions' });
        const upBtn = el('button', { type: 'button', class: 'btn btn--ghost btn--small' }, '↑');
        upBtn.disabled = idx === 0;
        upBtn.addEventListener('click', () => {
          const a = getPath(getRoot(), section.path);
          [a[idx - 1], a[idx]] = [a[idx], a[idx - 1]];
          rerender();
        });
        const downBtn = el('button', { type: 'button', class: 'btn btn--ghost btn--small' }, '↓');
        downBtn.disabled = idx === arr.length - 1;
        downBtn.addEventListener('click', () => {
          const a = getPath(getRoot(), section.path);
          [a[idx + 1], a[idx]] = [a[idx], a[idx + 1]];
          rerender();
        });
        const delBtn = el('button', { type: 'button', class: 'btn btn--danger btn--small' }, 'Remove');
        delBtn.addEventListener('click', () => {
          const a = getPath(getRoot(), section.path);
          a.splice(idx, 1);
          rerender();
        });
        actions.appendChild(upBtn);
        actions.appendChild(downBtn);
        actions.appendChild(delBtn);
        head.appendChild(actions);
        card.appendChild(head);

        const input = el('input', { type: 'text' });
        input.value = arr[idx] || '';
        input.addEventListener('input', () => {
          const a = getPath(getRoot(), section.path);
          a[idx] = input.value;
        });
        card.appendChild(input);
        list.appendChild(card);
      });
    }

    rerender();
    block.appendChild(list);

    const addBtn = el('button', { type: 'button', class: 'btn btn--ghost btn--small array-block__add' }, '+ ' + (section.addLabel || 'Add item'));
    addBtn.addEventListener('click', () => {
      const a = getPath(getRoot(), section.path);
      a.push('');
      rerender();
    });
    block.appendChild(addBtn);
    parent.appendChild(block);
  }

  // ---- Tab renderers --------------------------------------------------
  function renderThemeTab(main) {
    main.innerHTML = '';
    const intro = el('div', { class: 'admin-section' });
    intro.appendChild(el('div', { class: 'admin-section__head' }, [el('h2', {}, 'Brand colours')]));
    intro.appendChild(el('p', { class: 'admin-section__hint' },
      'Pick the colours that drive every page. Changes apply site-wide as soon as you save.'));
    main.appendChild(intro);

    const card = el('div', { class: 'admin-section' });
    COLOR_FIELDS.forEach(cf => {
      const row = el('div', { class: 'field field--color' });
      row.appendChild(el('label', { for: 'cf-' + cf.key }, cf.label));
      const colorInput = el('input', { type: 'color', id: 'cf-' + cf.key });
      colorInput.value = (theme[cf.key] || '#000000');
      const textInput = el('input', { type: 'text' });
      textInput.value = theme[cf.key] || '';
      colorInput.addEventListener('input', () => {
        theme[cf.key] = colorInput.value;
        textInput.value = colorInput.value;
      });
      textInput.addEventListener('input', () => {
        theme[cf.key] = textInput.value;
        if (/^#[0-9a-fA-F]{6}$/.test(textInput.value)) colorInput.value = textInput.value;
      });
      row.appendChild(textInput);
      row.appendChild(colorInput);
      card.appendChild(row);
    });
    main.appendChild(card);

    const bar = el('div', { class: 'save-bar' });
    bar.appendChild(el('span', { class: 'save-bar__status' }, 'Changes are saved when you click Save.'));
    const saveBtn = el('button', { type: 'button', class: 'btn btn--primary' }, 'Save colours');
    saveBtn.addEventListener('click', async () => {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving…';
      try {
        const res = await fetch('/api/theme', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(theme)
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
        toast('Colours saved', 'success');
        // Force re-fetch of theme.css so the admin (and any open site tab) reflects the change
        document.querySelectorAll('link[href*="theme.css"]').forEach(link => {
          link.href = '/css/theme.css?v=' + Date.now();
        });
      } catch (err) {
        toast(err.message || 'Save failed', 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save colours';
      }
    });
    bar.appendChild(saveBtn);
    main.appendChild(bar);
  }

  function renderContentTab(main, tab) {
    main.innerHTML = '';
    const getRoot = () => {
      // We mutate content directly within the configured path
      if (!tab.path) return content;
      let cur = content;
      tab.path.split('.').forEach(p => {
        if (cur[p] == null) cur[p] = {};
        cur = cur[p];
      });
      return cur;
    };

    const head = el('div', { class: 'admin-section' });
    head.appendChild(el('div', { class: 'admin-section__head' }, [el('h2', {}, tab.label)]));
    head.appendChild(el('p', { class: 'admin-section__hint' },
      'Edit the copy and images for this section of the site. Click Save changes when you\'re done.'));
    main.appendChild(head);

    // Two flavours: simple (fields directly on tab) or sectioned (tab.sections)
    if (tab.fields) {
      const wrap = el('div', { class: 'admin-section' });
      renderObjectFields(wrap, tab.fields, getRoot, '');
      main.appendChild(wrap);
    }
    if (tab.sections) {
      tab.sections.forEach(section => {
        const wrap = el('div', { class: 'admin-section' });
        wrap.appendChild(el('h3', {}, section.title));
        if (section.kind === 'object-list') {
          renderObjectList(wrap, section, getRoot);
        } else if (section.kind === 'list') {
          renderStringList(wrap, section, getRoot);
        } else {
          renderObjectFields(wrap, section.fields, getRoot, section.path || '');
        }
        main.appendChild(wrap);
      });
    }

    // Save bar
    const bar = el('div', { class: 'save-bar' });
    bar.appendChild(el('span', { class: 'save-bar__status' }, 'Changes are saved when you click Save.'));
    const saveBtn = el('button', { type: 'button', class: 'btn btn--primary' }, 'Save changes');
    saveBtn.addEventListener('click', async () => {
      saveBtn.disabled = true;
      saveBtn.textContent = 'Saving…';
      try {
        const res = await fetch('/api/content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(content)
        });
        if (!res.ok) throw new Error((await res.json()).error || 'Save failed');
        toast('Saved — refresh the public site to see the changes', 'success');
      } catch (err) {
        toast(err.message || 'Save failed', 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = 'Save changes';
      }
    });
    bar.appendChild(saveBtn);
    main.appendChild(bar);
  }

  // ---- Top-level wiring ----------------------------------------------
  function buildTabsSidebar() {
    const tabsEl = document.getElementById('tabs');
    tabsEl.innerHTML = '';
    TAB_GROUPS.forEach(group => {
      tabsEl.appendChild(el('div', { class: 'admin-tabs__group' }, group.group));
      group.tabs.forEach(tab => {
        const btn = el('button', { type: 'button', 'data-tab': tab.id }, tab.label);
        btn.addEventListener('click', () => activateTab(tab.id));
        tabsEl.appendChild(btn);
      });
    });
  }

  function findTab(id) {
    for (const g of TAB_GROUPS) {
      const found = g.tabs.find(t => t.id === id);
      if (found) return found;
    }
    return null;
  }

  function activateTab(id) {
    currentTabId = id;
    document.querySelectorAll('.admin-tabs button').forEach(b => {
      b.classList.toggle('is-active', b.getAttribute('data-tab') === id);
    });
    const main = document.getElementById('main');
    const tab = findTab(id);
    if (!tab) return;
    if (tab.kind === 'theme') renderThemeTab(main);
    else renderContentTab(main, tab);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  async function init() {
    try {
      const [contentRes, themeRes] = await Promise.all([
        fetch('/api/content'), fetch('/api/theme')
      ]);
      content = await contentRes.json();
      theme = await themeRes.json();
      buildTabsSidebar();
      activateTab('home');
    } catch (err) {
      document.getElementById('main').innerHTML =
        '<p style="color:#8a2a20">Failed to load CMS data: ' + (err.message || err) + '</p>';
    }
  }

  init();
})();
