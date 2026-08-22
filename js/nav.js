export function initNav() {
  document.addEventListener('click', function (e) {
    var toggle = e.target.closest('#navToggle');
    var topbar = document.querySelector('.topbar');
    if (!topbar) return;

    if (toggle) {
      var open = topbar.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      return;
    }

    if (e.target.closest('.nav-links a')) {
      topbar.classList.remove('is-open');
      var btn = document.getElementById('navToggle');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    }
  });
}
