const normalizeProductName = (value = "") =>
  value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

const restrictedPattern =
  /retatrut|\breta\b|tirzep|tirzec|synedica|\btg\b|bpc|tb-500|ipamorelin|ghk|hgh fragment|kpv|pt-141|ss-31|mostc|hutox|israderm|dysport|nad\+|klow/i;

const tagRules = [
  ["dermocosmeticos", /medicube|celimax|retinol|pore|serum|cream|cleanser|mask|pdrn/i],
  ["proteinas", /whey|iso100|carnivor|protein bar|protein cookie|serious mass|good whey/i],
  ["performance", /c4|vapor|pre.?treino|creatine|creatina|bcaa|animal pak/i],
  ["vitaminas", /multivit|mineral|vitamin|maxivit|vitafor|gnc kids|gnc mega|opti-men|hair skin nails/i],
  ["infantil", /kids|infantil/i],
  ["articulacoes", /osteo|triflex|joint|magnesium|magnesio/i],
  ["omega", /omega|fish oil/i],
  ["sono", /melatonin|valeriana|magnesium|magnesio/i],
  ["beleza", /hair skin nails|pdrn|collagen|retinol|glow/i],
  ["digestao", /digestive|enzymes|enzimas/i],
  ["controle-peso", /lipo 6|slimex|controle de peso|termogen|retatrut|tirzep|tirzec/i],
  ["bem-estar", /argimax|citrumax|vertiumline|vitamin|omega/i],
];

const categoryTags = {
  "dermocosmeticos": ["dermocosmeticos", "beleza"],
  "nutricao esportiva": ["performance", "proteinas"],
  "suplementos": ["vitaminas", "bem-estar"],
  "estetica & botox": ["beleza"],
  "peptideos": ["bem-estar"],
  "controle de peso": ["controle-peso", "bem-estar"],
};

const complements = {
  proteinas: ["performance"],
  performance: ["proteinas", "vitaminas"],
  vitaminas: ["omega", "bem-estar"],
  infantil: ["vitaminas"],
  articulacoes: ["omega", "vitaminas"],
  omega: ["articulacoes", "vitaminas"],
  sono: ["bem-estar", "vitaminas"],
  dermocosmeticos: ["beleza"],
  beleza: ["dermocosmeticos", "vitaminas"],
  digestao: ["bem-estar"],
  "controle-peso": ["proteinas", "performance"],
  "bem-estar": ["vitaminas", "omega"],
};

const tagWeights = {
  infantil: 34,
  dermocosmeticos: 26,
  proteinas: 26,
  performance: 24,
  articulacoes: 24,
  sono: 24,
  digestao: 24,
  "controle-peso": 24,
  omega: 20,
  beleza: 18,
  vitaminas: 12,
  "bem-estar": 8,
};

const getTags = (name, category = "") => {
  const normalizedName = normalizeProductName(name);
  const normalizedCategory = normalizeProductName(category);
  const tags = new Set(categoryTags[normalizedCategory] || []);
  tagRules.forEach(([tag, pattern]) => {
    if (pattern.test(normalizedName)) tags.add(tag);
  });
  return [...tags];
};

const stableTieBreaker = (currentName, candidateName) => {
  const value = normalizeProductName(currentName + candidateName);
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
};

const scoreCandidate = (currentTags, candidateTags) => {
  let score = 0;
  currentTags.forEach((tag) => {
    if (candidateTags.includes(tag)) score += tagWeights[tag] || 12;
    (complements[tag] || []).forEach((complement) => {
      if (candidateTags.includes(complement)) score += 5;
    });
  });
  return score;
};

const createRelatedCard = ({ name, image, href }) => {
  const article = document.createElement("article");
  article.className = "product-card";
  article.innerHTML = `
    <div class="product-image"><img src="${image}" alt="${name}" loading="lazy" /></div>
    <h2></h2>
    <p class="price"><strong>Consulte</strong><span>/ WhatsApp</span></p>
    <a>Ver produto</a>
  `;
  article.querySelector("h2").textContent = name;
  const link = article.querySelector("a");
  link.href = href;
  return article;
};

const updateRelatedProducts = async () => {
  const section = document.querySelector(".related-products-section");
  const grid = section?.querySelector(".products-grid");
  const currentName = document.querySelector(".product-detail-copy h1")?.textContent.trim();
  if (!section || !grid || !currentName) return;

  try {
    const response = await fetch("./produtos.html");
    if (!response.ok) return;
    const catalogDocument = new DOMParser().parseFromString(await response.text(), "text/html");
    const products = [...catalogDocument.querySelectorAll(".catalog-card")].map((card) => ({
      name: card.querySelector("h4")?.textContent.trim() || "",
      image: card.querySelector(".catalog-image img")?.getAttribute("src") || "",
      href: card.querySelector("a")?.getAttribute("href") || "",
    })).filter((product) => product.name && product.image && product.href);

    const category =
      [...document.querySelectorAll(".breadcrumb a")].at(-1)?.textContent.trim() || "";
    const currentTags = getTags(currentName, category);
    const currentNormalized = normalizeProductName(currentName);

    const ranked = products
      .filter((product) =>
        normalizeProductName(product.name) !== currentNormalized &&
        !restrictedPattern.test(normalizeProductName(product.name))
      )
      .map((product) => ({
        ...product,
        score: scoreCandidate(currentTags, getTags(product.name)),
        tie: stableTieBreaker(currentName, product.name),
      }))
      .sort((first, second) => second.score - first.score || first.tie - second.tie)
      .slice(0, 4);

    if (ranked.length < 4) return;
    grid.replaceChildren(...ranked.map(createRelatedCard));
    section.dataset.recommendation = "dynamic";
  } catch (_) {
    // Mantém os cards estáticos como fallback caso o catálogo não carregue.
  }
};

updateRelatedProducts();
