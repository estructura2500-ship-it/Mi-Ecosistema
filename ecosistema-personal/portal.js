(() => {
  const grid = document.querySelector('#appGrid');
  const search = document.querySelector('#search');
  const installBtn = document.querySelector('#installBtn');
  const apps = window.PERSONAL_APPS || [];
  let installPrompt = null;
  document.querySelector('#appCount').textContent = apps.length;
  const esc = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  function render() {
    const q = search.value.trim().toLocaleLowerCase('es');
    const visible = apps.filter(app => `${app.name} ${app.category} ${app.description}`.toLocaleLowerCase('es').includes(q));
    grid.innerHTML = visible.length ? visible.map(app => `
      <article class="app-card" style="--accent:${esc(app.color)}">
        <div class="card-top"><span class="app-icon" aria-hidden="true">${esc(app.icon)}</span><span class="app-category">${esc(app.category.toUpperCase())}</span></div>
        <h3>${esc(app.name)}</h3><p>${esc(app.description)}</p>
        <a class="card-open" href="./${esc(app.href)}"><span>Abrir aplicación</span><span aria-hidden="true">↗</span></a>
      </article>`).join('') : '<div class="empty">No encontré una app con ese nombre.</div>';
  }
  search.addEventListener('input', render);
  window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); installPrompt = event; installBtn.hidden = false; });
  installBtn.addEventListener('click', async () => { if (!installPrompt) return; await installPrompt.prompt(); installPrompt = null; installBtn.hidden = true; });
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(() => {});
  render();
})();
