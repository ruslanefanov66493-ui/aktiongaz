/* AktionGaz — Liquid Glass interactions (vanilla, no deps) */
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ---------- Header: compact capsule on scroll ---------- */
  const header = $('[data-header]');
  const heroImg = $('.hero__bg img[data-parallax]');
  let scrollRaf = 0;
  function onScroll() {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = 0;
      const y = window.scrollY;
      if (header) header.classList.toggle('is-scrolled', y > 24);
      if (!reduced && heroImg && y < window.innerHeight * 1.2) {
        // gentle parallax: move 18% of scroll distance, only while hero visible
        heroImg.style.setProperty('--py', (y * 0.18).toFixed(1) + 'px');
      }
    });
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile nav ---------- */
  const toggle = $('[data-nav-toggle]');
  const mobileNav = $('[data-mobile-nav]');
  function closeMobile() {
    if (!mobileNav || !toggle) return;
    mobileNav.setAttribute('hidden', '');
    toggle.setAttribute('aria-expanded', 'false');
  }
  if (toggle && mobileNav) {
    toggle.addEventListener('click', () => {
      const open = mobileNav.hasAttribute('hidden');
      if (open) mobileNav.removeAttribute('hidden'); else mobileNav.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    document.addEventListener('click', (e) => {
      if (mobileNav.hasAttribute('hidden')) return;
      if (!mobileNav.contains(e.target) && !toggle.contains(e.target)) closeMobile();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMobile(); });
  }

  /* ---------- Cursor-tracked refraction highlight (--mx/--my) ---------- */
  if (!reduced && window.matchMedia('(hover: hover)').matches) {
    let raf = 0, target = null, px = 0, py = 0;
    document.addEventListener('pointermove', (e) => {
      const el = e.target.closest ? e.target.closest('.glass, .btn-pill--glass, .chip, .icon-btn') : null;
      if (!el) return;
      target = el; px = e.clientX; py = e.clientY;
      if (!raf) raf = requestAnimationFrame(() => {
        raf = 0;
        if (!target) return;
        const r = target.getBoundingClientRect();
        target.style.setProperty('--mx', ((px - r.left) / r.width * 100).toFixed(1) + '%');
        target.style.setProperty('--my', ((py - r.top) / r.height * 100).toFixed(1) + '%');
      });
    }, { passive: true });
  }

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$('.reveal, .reveal-stagger');
  if (revealEls.length) {
    const forceAll = reduced || !('IntersectionObserver' in window) || /[?&]static\b/.test(location.search);
    if (forceAll) {
      revealEls.forEach((el) => el.classList.add('is-in'));
    } else {
      // threshold 0: a block taller than the screen can never be 8% visible,
      // so it stayed transparent. Expand the bottom edge so items already
      // sitting in the lower part of the viewport appear immediately.
      const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
        });
      }, { rootMargin: '0px 0px 20% 0px', threshold: 0 });
      revealEls.forEach((el) => io.observe(el));
    }
  }

  /* ---------- Rail (carousel) ---------- */
  $$('[data-rail]').forEach((wrap) => {
    const rail = $('.rail', wrap);
    const prev = $('[data-rail-prev]', wrap);
    const next = $('[data-rail-next]', wrap);
    if (!rail) return;
    const step = () => {
      const card = rail.firstElementChild;
      return card ? card.getBoundingClientRect().width + 20 : rail.clientWidth * 0.8;
    };
    const update = () => {
      const max = rail.scrollWidth - rail.clientWidth - 2;
      if (prev) prev.disabled = rail.scrollLeft <= 2;
      if (next) next.disabled = rail.scrollLeft >= max;
    };
    prev && prev.addEventListener('click', () => rail.scrollBy({ left: -step(), behavior: reduced ? 'auto' : 'smooth' }));
    next && next.addEventListener('click', () => rail.scrollBy({ left: step(), behavior: reduced ? 'auto' : 'smooth' }));
    rail.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  });

  /* ---------- Chip filters ---------- */
  $$('[data-filter-bar]').forEach((bar) => {
    const targetSel = bar.getAttribute('data-filter-target');
    const items = targetSel ? $$(targetSel) : [];
    const chips = $$('.chip', bar);
    chips.forEach((chip) => chip.addEventListener('click', () => {
      const val = chip.getAttribute('data-filter') || 'all';
      chips.forEach((c) => c.setAttribute('aria-pressed', c === chip ? 'true' : 'false'));
      items.forEach((it) => {
        const cats = (it.getAttribute('data-cat') || '').split(/\s+/);
        it.classList.toggle('is-hidden', !(val === 'all' || cats.includes(val)));
      });
    }));
  });

  /* ---------- Consult modal ---------- */
  const modal = $('[data-consult-modal]');
  function setProduct(form, name) {
    if (!form) return;
    const input = form.querySelector('input[name="product"]');
    if (input) input.value = name || '';
    let note = form.querySelector('.consult-form__product');
    if (name) {
      if (!note) {
        note = document.createElement('p');
        note.className = 'consult-form__product';
        note.innerHTML = '<span>Оборудование:</span> <strong></strong>';
        form.prepend(note);
      }
      note.hidden = false;
      note.querySelector('strong').textContent = name;
    } else if (note) {
      note.hidden = true;
    }
  }
  function openModal(productName) {
    if (!modal) return;
    setProduct(modal.querySelector('.consult-form'), productName);
    if (typeof modal.showModal === 'function' && !modal.open) modal.showModal();
    const first = modal.querySelector('input[name="name"]');
    if (first) setTimeout(() => first.focus(), 60);
  }
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-open-consult]');
    if (!btn) return;
    const product = btn.getAttribute('data-product') || '';
    const href = btn.getAttribute('href') || '';
    const inlineTarget = href && href.startsWith('#') ? document.querySelector(href) : null;
    // Prefer scrolling to an inline form when one exists on the page; otherwise open the modal.
    if (inlineTarget && !product) {
      closeMobile();
      return; // allow native anchor scroll
    }
    e.preventDefault();
    closeMobile();
    openModal(product);
  });
  $$('[data-close-consult]').forEach((b) => b.addEventListener('click', () => modal && modal.close()));
  if (modal) {
    modal.addEventListener('click', (e) => {
      const panel = modal.firstElementChild;
      if (panel && !panel.contains(e.target)) modal.close();
    });
  }

  /* ---------- Forms: AJAX submit ---------- */
  $$('.consult-form').forEach((form) => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const status = form.querySelector('.consult-form__status');
      const submit = form.querySelector('[type="submit"]');
      const show = (msg, isError) => {
        if (!status) return;
        status.hidden = false;
        status.classList.toggle('is-error', !!isError);
        status.textContent = msg;
      };
      const cfg = window.aktiongazData || {};
      if (!cfg.ajaxUrl) {
        show(cfg.previewMessage || 'Превью: в WordPress заявка уйдёт на e-mail отдела продаж.', false);
        return;
      }
      if (submit) submit.disabled = true;
      try {
        const res = await fetch(cfg.ajaxUrl, { method: 'POST', body: new FormData(form), credentials: 'same-origin' });
        const json = await res.json();
        show((json.data && json.data.message) || (json.success ? 'Отправлено' : 'Ошибка'), !json.success);
        if (json.success) form.reset();
      } catch (err) {
        show('Сеть недоступна. Позвоните: 8 (8453) 76-30-30', true);
      } finally {
        if (submit) submit.disabled = false;
      }
    });
  });

  /* ---------- Lightbox (data-lightbox="group") ---------- */
  const lb = $('[data-lightbox-dialog]');
  if (lb) {
    const img = $('img', lb);
    const counter = $('[data-lightbox-counter]', lb);
    let items = [], index = 0;

    const render = () => {
      const a = items[index];
      if (!a) return;
      img.src = a.getAttribute('href');
      const thumb = a.querySelector('img');
      img.alt = thumb ? thumb.alt : '';
      if (counter) counter.textContent = items.length > 1 ? (index + 1) + ' / ' + items.length : '';
    };
    const show = (i) => {
      if (!items.length) return;
      index = (i + items.length) % items.length;
      if (!reduced && document.startViewTransition) {
        document.startViewTransition(render);
      } else {
        img.classList.remove('is-swapping'); void img.offsetWidth; img.classList.add('is-swapping');
        render();
      }
    };

    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[data-lightbox]');
      if (!a) return;
      e.preventDefault();
      const group = a.getAttribute('data-lightbox');
      items = $$('a[data-lightbox="' + group + '"]');
      index = Math.max(0, items.indexOf(a));
      render();
      if (typeof lb.showModal === 'function' && !lb.open) lb.showModal();
    });

    $('[data-lightbox-close]', lb).addEventListener('click', () => lb.close());
    $('[data-lightbox-prev]', lb).addEventListener('click', () => show(index - 1));
    $('[data-lightbox-next]', lb).addEventListener('click', () => show(index + 1));
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
    lb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
    lb.addEventListener('close', () => { img.src = ''; });

    // swipe
    let sx = 0;
    lb.addEventListener('touchstart', (e) => { sx = e.touches[0].clientX; }, { passive: true });
    lb.addEventListener('touchend', (e) => {
      const dx = e.changedTouches[0].clientX - sx;
      if (Math.abs(dx) > 40) show(dx < 0 ? index + 1 : index - 1);
    });
  }
})();
