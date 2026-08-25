export function initCertCarousel() {
  const viewport = document.querySelector('.cert-viewport');
  const track = document.querySelector('[data-cert-track]');
  const dotsWrap = document.querySelector('[data-cert-dots]');
  if (!viewport || !track || !dotsWrap) return;

  const cards = Array.from(track.querySelectorAll('.cert'));
  if (!cards.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const dragThreshold = 8;

  let startX = 0;
  let startScroll = 0;
  let dragging = false;
  let dragged = false;
  let raf = 0;

  function cardOffset(card) {
    return card.getBoundingClientRect().left - viewport.getBoundingClientRect().left + viewport.scrollLeft;
  }

  function nearestIndex() {
    const x = viewport.scrollLeft;
    let best = 0;
    let bestDist = Infinity;
    cards.forEach(function (card, i) {
      const dist = Math.abs(cardOffset(card) - x);
      if (dist < bestDist) {
        bestDist = dist;
        best = i;
      }
    });
    return best;
  }

  function syncDots() {
    const page = nearestIndex();
    dotsWrap.querySelectorAll('.cert-dot').forEach(function (dot, n) {
      dot.classList.toggle('is-on', n === page);
    });
  }

  function scrollToCard(index, animate) {
    const card = cards[Math.max(0, Math.min(index, cards.length - 1))];
    if (!card) return;
    viewport.scrollTo({
      left: cardOffset(card),
      behavior: animate && !reduce ? 'smooth' : 'auto'
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

  dotsWrap.addEventListener('click', function (e) {
    const t = e.target;
    if (!(t instanceof Element)) return;
    const dot = t.closest('.cert-dot');
    if (!dot) return;
    scrollToCard(Array.prototype.indexOf.call(dotsWrap.children, dot), true);
  });

  viewport.addEventListener('scroll', function () {
    if (raf) return;
    raf = window.requestAnimationFrame(function () {
      raf = 0;
      syncDots();
    });
  }, { passive: true });

  function onPointerDown(e) {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    dragging = true;
    dragged = false;
    startX = e.clientX;
    startScroll = viewport.scrollLeft;
    viewport.classList.add('is-dragging');
  }

  function onPointerMove(e) {
    if (!dragging) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > dragThreshold) dragged = true;
    viewport.scrollLeft = startScroll - dx;
  }

  function onPointerEnd() {
    if (!dragging) return;
    dragging = false;
    viewport.classList.remove('is-dragging');
  }

  viewport.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerEnd);
  window.addEventListener('pointercancel', onPointerEnd);

  viewport.addEventListener('click', function (e) {
    if (!dragged) return;
    e.preventDefault();
    e.stopPropagation();
    dragged = false;
  }, true);

  viewport.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollToCard(nearestIndex() + 1, true);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      scrollToCard(nearestIndex() - 1, true);
    }
  });

  syncDots();
}
