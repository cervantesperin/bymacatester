(function () {
  const fallbackRate = "R$ 5,20";
  const cacheKey = "bymacDollarRate";
  const cacheDateKey = "bymacDollarRateDate";
  const today = new Date().toISOString().slice(0, 10);
  const sourceUrl = "https://mobile.comprasparaguai.com.br/";
  const proxyUrl = "https://api.allorigins.win/raw?url=" + encodeURIComponent(sourceUrl);

  function setRate(value) {
    const normalized = value && /^R\$\s?\d+,\d{2}$/.test(value.trim()) ? value.trim().replace("R$", "R$ ") : fallbackRate;
    document.querySelectorAll(".currency-rate strong").forEach((node) => {
      node.textContent = normalized;
    });
  }

  function extractRate(html) {
    const direct = html.match(/class=["'][^"']*cotacao-real[^"']*["'][^>]*>\s*(R\$\s?\d+,\d{2})/i);
    if (direct) return direct[1];
    const loose = html.match(/R\$\s?\d+,\d{2}/);
    return loose ? loose[0] : "";
  }

  async function readRate() {
    const cached = localStorage.getItem(cacheKey);
    const cachedDate = localStorage.getItem(cacheDateKey);
    if (cached && cachedDate === today) return cached;

    const urls = [sourceUrl, proxyUrl];
    for (const url of urls) {
      try {
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) continue;
        const rate = extractRate(await response.text());
        if (rate) {
          localStorage.setItem(cacheKey, rate);
          localStorage.setItem(cacheDateKey, today);
          return rate;
        }
      } catch (error) {
        // Try the next source.
      }
    }

    return cached || fallbackRate;
  }

  setRate(localStorage.getItem(cacheKey) || fallbackRate);
  readRate().then(setRate);
})();
