
// Updated navigation JS (from previous final version)

(function () {
  function isInside(el, container) {
    return container && (container === el || container.contains(el));
  }
  function debounce(fn, wait) {
    let t = null;
    return function (...args) {
      if (t) clearTimeout(t);
      t = setTimeout(() => fn.apply(this, args), wait);
    };
  }
})
  const nav = document.getElementById('main-nav');
  const menu = document.getElementById('navMenu');
  const btn = document.getElementById('mobileMenuBtn');
  if (!nav || !menu || !btn) return;

  btn.setAttribute('aria-expanded', 'false');
  nav.classList.remove('mobile-open');

  function updateActiveLink() {
    let current = window.location.pathname;
    current = current.split('/').pop() || 'index.html';
    current = current.replace(/\/+$/, '');
    if (current === '') current = 'index.html';
    const links = document.querySelectorAll('.nav-link');
    links.forEach((a) => {
      const href = (a.dataset.href || a.getAttribute('href') || '').trim();
      let target = href.split('/').pop();
      target = target || href;
      target = target.replace(/\/+$/, '');
      const isActive = target === current;
      a.classList.toggle('active', isActive);
    });
  }

  function openMenu() {
    btn.setAttribute('aria-expanded', 'true');
    nav.classList.add('mobile-open');
  }
  function closeMenu() {
    btn.setAttribute('aria-expanded', 'false');
    nav.classList.remove('mobile-open');
  }

  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    if (nav.classList.contains('mobile-open')) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  document.addEventListener('click', function (e) {
    if (!isInside(e.target, nav) && !isInside(e.target, btn)) {
      closeMenu();
    }
  });

    window.addEventListener('resize', debounce(closeMenu, 300));
    window.addEventListener('DOMContentLoaded', updateActiveLink);
    window.addEventListener('load', updateActiveLink);
    window.addEventListener('popstate', updateActiveLink);

