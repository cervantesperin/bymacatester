(function () {
  const fallbackRate = 5.2;
  const cacheKey = "bymacDollarRateNumeric";
  const cacheDateKey = "bymacDollarRateDate";
  const today = new Date().toISOString().slice(0, 10);
  const brlFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
  const usdFormatter = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "USD" });

  function formatBcbDate(date) {
    return `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}-${date.getFullYear()}`;
  }

  function buildBcbUrl() {
    const end = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - 7);
    const params = new URLSearchParams({
      "@dataInicial": `'${formatBcbDate(start)}'`,
      "@dataFinalCotacao": `'${formatBcbDate(end)}'`,
      "$top": "1",
      "$orderby": "dataHoraCotacao desc",
      "$format": "json",
    });
    return `https://olinda.bcb.gov.br/olinda/servico/PTAX/versao/v1/odata/CotacaoDolarPeriodo(dataInicial=@dataInicial,dataFinalCotacao=@dataFinalCotacao)?${params}`;
  }

  function normalizeRate(value) {
    const parsed = Number(String(value).replace("R$", "").replace(",", ".").trim());
    return Number.isFinite(parsed) && parsed > 0 ? parsed : fallbackRate;
  }

  function updatePrices(rate) {
    document.querySelectorAll("[data-usd-price]").forEach((price) => {
      const usd = Number(price.dataset.usdPrice);
      if (!Number.isFinite(usd)) return;
      const usdNode = price.querySelector(".usd-price");
      const brlNode = price.querySelector(".brl-price");
      if (usdNode) usdNode.textContent = usdFormatter.format(usd);
      if (brlNode) {
        const prefix = price.classList.contains("detail-price") ? "" : "/ ";
        brlNode.textContent = `${prefix}${brlFormatter.format(usd * rate)}`;
      }
    });
  }

  function setRate(value) {
    const rate = normalizeRate(value);
    document.querySelectorAll(".currency-rate strong").forEach((node) => {
      node.textContent = brlFormatter.format(rate);
    });
    updatePrices(rate);
  }

  async function readRate() {
    const cached = localStorage.getItem(cacheKey);
    const cachedDate = localStorage.getItem(cacheDateKey);
    if (cached && cachedDate === today) return normalizeRate(cached);

    try {
      const response = await fetch(buildBcbUrl(), { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        const rate = normalizeRate(data.value?.[0]?.cotacaoVenda);
        localStorage.setItem(cacheKey, String(rate));
        localStorage.setItem(cacheDateKey, today);
        return rate;
      }
    } catch (_) {
      // A cotação em cache ou a reserva abaixo mantém os preços disponíveis.
    }

    return cached ? normalizeRate(cached) : fallbackRate;
  }

  setRate(localStorage.getItem(cacheKey) || fallbackRate);
  readRate().then(setRate);
})();
