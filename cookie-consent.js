(() => {
  const resetRequested = new URLSearchParams(window.location.search).get('hard-reset') === '1';

  if (resetRequested) {
    localStorage.clear();
    sessionStorage.clear();
    document.cookie.split(';').forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    });

    if ('caches' in window) {
      caches.keys().then(keys => Promise.all(keys.map(key => caches.delete(key))));
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => registration.unregister());
      });
    }

    const cleanUrl = new URL(window.location.href);
    cleanUrl.searchParams.delete('hard-reset');
    cleanUrl.searchParams.set('refreshed', '20260816-1');
    window.history.replaceState({}, '', cleanUrl);
  }

  const STORAGE_KEY = 'bymac-cookie-consent-v2';
  if (localStorage.getItem(STORAGE_KEY)) return;

  const banner = document.createElement('aside');
  banner.className = 'cookie-consent';
  banner.setAttribute('role', 'dialog');
  banner.setAttribute('aria-label', 'Preferências de cookies');
  banner.innerHTML = `
    <div class="cookie-consent-copy">
      <strong>Sua privacidade importa</strong>
      <p>Utilizamos cookies essenciais para o funcionamento do site e, com sua autorização, dados de navegação para melhorar sua experiência. Consulte nossa <a href="./politica-de-privacidade.html">Política de Privacidade</a>.</p>
    </div>
    <div class="cookie-consent-actions">
      <button class="button cookie-essential" type="button">Somente essenciais</button>
      <button class="button primary cookie-accept" type="button">Aceitar cookies</button>
    </div>`;

  const save = value => {
    localStorage.setItem(STORAGE_KEY, value);
    banner.classList.add('is-closing');
    window.setTimeout(() => banner.remove(), 220);
  };

  banner.querySelector('.cookie-essential').addEventListener('click', () => save('essential'));
  banner.querySelector('.cookie-accept').addEventListener('click', () => save('accepted'));
  document.body.appendChild(banner);
})();
