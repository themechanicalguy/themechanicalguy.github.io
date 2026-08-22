export function initReveal() {
  document.documentElement.classList.add('js-ready');

  var nodes = document.querySelectorAll('.reveal:not(.in)');
  if (!nodes.length) return;

  if (!('IntersectionObserver' in window)) {
    nodes.forEach(function (el) { el.classList.add('in'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -8% 0px' });

  nodes.forEach(function (el) { io.observe(el); });
}
