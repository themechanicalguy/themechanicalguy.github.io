(function () {
  var root = document.documentElement;

  function currentTheme() {
    return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    var label = document.getElementById('themeLabel');
    if (label) label.textContent = theme.toUpperCase();
    try { localStorage.setItem('theme', theme); } catch (e) {}
  }

  try {
    var saved = localStorage.getItem('theme');
    if (saved === 'light' || saved === 'dark') applyTheme(saved);
  } catch (e) {}

  document.addEventListener('click', function (e) {
    var btn = document.getElementById('themeToggle');
    if (!btn || !btn.contains(e.target)) return;
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
  });
})();
