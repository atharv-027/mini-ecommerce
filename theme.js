/* ==========================================================================
   THEME TOGGLE (click handling only)
   The actual theme is APPLIED earlier via an inline blocking script in
   <head> on every page (before CSS loads) to avoid a flash of the wrong
   theme when navigating between pages. This file just wires up the
   toggle button and keeps localStorage in sync.
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  updateIcon(document.documentElement.getAttribute('data-theme') || 'light');

  btn.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateIcon(next);
  });

  function updateIcon(theme) {
    btn.textContent = theme === 'dark' ? '☀️' : '🌙';
  }
});
