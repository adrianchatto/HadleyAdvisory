/* ============================================================
   HADLEY ADVISORY — SHARED JAVASCRIPT
   Mobile nav, footer year, scroll reveals, hero word rotator,
   contact-form handler.
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ----- Mobile nav toggle ----- */
  const toggle = document.querySelector('.nav__toggle');
  const menu   = document.querySelector('.nav__menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        if (menu.classList.contains('is-open')) {
          menu.classList.remove('is-open');
          toggle.classList.remove('is-open');
          document.body.style.overflow = '';
        }
      });
    });
  }

  /* ----- Footer year ----- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ----- Highlight active nav link ----- */
  const path = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav__menu a').forEach(a => {
    const href = a.getAttribute('href');
    if (href === path) a.classList.add('is-active');
  });

  /* ----- Scroll-triggered fade-up reveals -----
     Any element with class .reveal will fade and slide up
     once it enters the viewport. Honours reduced-motion. */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reveals = document.querySelectorAll('.reveal');
  if (reveals.length && 'IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    // Reduced motion or no IO — just show immediately
    reveals.forEach(el => el.classList.add('is-visible'));
  }

  /* ----- Hero word rotator -----
     Looks for [data-rotate-words="word1,word2,word3"] inside .word-swap
     and cycles them with a subtle slide/fade. */
  const swap = document.querySelector('.word-swap');
  if (swap && !reduceMotion) {
    const words = (swap.getAttribute('data-rotate-words') || '').split(',').map(s => s.trim()).filter(Boolean);
    if (words.length > 1) {
      let idx = 0;
      swap.textContent = words[0];
      setInterval(() => {
        swap.classList.add('is-leaving');
        setTimeout(() => {
          idx = (idx + 1) % words.length;
          swap.textContent = words[idx];
          swap.classList.remove('is-leaving');
          swap.classList.add('is-entering');
          setTimeout(() => swap.classList.remove('is-entering'), 380);
        }, 280);
      }, 2600);
    }
  }

  /* ----- Contact form (placeholder handler) ----- */
  const form = document.querySelector('.form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const status = form.querySelector('.form__status');
      if (status) {
        status.textContent =
          'Thanks — your message has been captured locally. ' +
          'Connect a form service (Formspree, Netlify Forms, etc.) when you go live.';
        status.style.color = 'var(--color-accent-dark)';
      }
      form.reset();
    });
  }

});
