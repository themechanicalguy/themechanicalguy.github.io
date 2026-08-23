export function initCertCarousel() {
  const viewport = document.querySelector('.cert-viewport');
  const track = document.querySelector('[data-cert-track]');
  const prev = document.getElementById('certPrev') || document.querySelector('[data-cert-prev]');
  const next = document.getElementById('certNext') || document.querySelector('[data-cert-next]');
  const dotsWrap = document.querySelector('[data-cert-dots]');
  if (!viewport || !track || !prev || !next || !dotsWrap) return;

  const cards = Array.from(track.querySelectorAll('.cert'));
  if (!cards.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  track.style.transition = reduce ? 'none' : 'transform 0.35s ease';

  let page = 0;
  let startX = 0;
  let dragging = false;
  let wheelLock = false;

  function gap() {
    return parseFloat(getComputedStyle(track).gap) || 0;
  }

  function perView() {
    const w = viewport.clientWidth;
    if (w >= 1080) return 3;
    if (w >= 720) return 2;
    return 1;
  }

  function maxPage() {
    return Math.max(0, cards.length - perView());
  }

  function step() {
    return cards[0].getBoundingClientRect().width + gap();
  }

  function render() {
    page = Math.max(0, Math.min(page, maxPage()));
    track.style.transform = 'translateX(' + (-page * step()) + 'px)';
    prev.classList.toggle('is-off', page <= 0);
    next.classList.toggle('is-off', page >= maxPage());
    prev.setAttribute('aria-disabled', page <= 0 ? 'true' : 'false');
    next.setAttribute('aria-disabled', page >= maxPage() ? 'true' : 'false');
    dotsWrap.querySelectorAll('.cert-dot').forEach(function (dot, n) {
      dot.classList.toggle('is-on', n === page);
    });
  }

  dotsWrap.innerHTML = '';
  cards.forEach(function (_, i) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'cert-dot';
    dot.setAttribute('aria-label', 'Go to certificate ' + (i + 1));
    dotsWrap.appendChild(dot);
  });

  function onClick(e) {
    const t = e.target;
    if (!(t instanceof Element)) return;
    if (t.closest('#certNext, [data-cert-next]')) {
      e.preventDefault();
      page += 1;
      render();
      return;
    }
    if (t.closest('#certPrev, [data-cert-prev]')) {
      e.preventDefault();
      page -= 1;
      render();
      return;
    }
    const dot = t.closest('.cert-dot');
    if (dot && dotsWrap.contains(dot)) {
      page = Array.prototype.indexOf.call(dotsWrap.children, dot);
      render();
    }
  }

  document.addEventListener('click', onClick);

  viewport.addEventListener('pointerdown', function (e) {
    dragging = true;
    startX = e.clientX;
  });
  viewport.addEventListener('pointerup', function (e) {
    if (!dragging) return;
    dragging = false;
    const dx = e.clientX - startX;
    if (dx < -40) page += 1;
    if (dx > 40) page -= 1;
    render();
  });
  viewport.addEventListener('pointerleave', function () { dragging = false; });

  viewport.addEventListener('wheel', function (e) {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    if (wheelLock) return;
    if (e.deltaX > 12) page += 1;
    else if (e.deltaX < -12) page -= 1;
    else return;
    wheelLock = true;
    render();
    window.setTimeout(function () { wheelLock = false; }, 320);
  }, { passive: false });

  window.addEventListener('resize', render);
  render();
}
