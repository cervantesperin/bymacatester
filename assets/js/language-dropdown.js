(function () {
  const storageKey = "bymacLanguage";
  const labels = {
    pt: "PT",
    es: "ES",
    en: "EN",
  };
  const htmlLang = {
    pt: "pt-BR",
    es: "es",
    en: "en",
  };

  const selectors = Array.from(document.querySelectorAll(".language-selector"));

  if (!selectors.length) {
    return;
  }

  const getSavedLanguage = () => {
    try {
      return localStorage.getItem(storageKey) || "pt";
    } catch (error) {
      return "pt";
    }
  };

  const saveLanguage = (language) => {
    try {
      localStorage.setItem(storageKey, language);
    } catch (error) {
      return;
    }
  };

  const closeAll = () => {
    selectors.forEach((selector) => {
      selector.classList.remove("open");
      selector.querySelector(".language-button")?.setAttribute("aria-expanded", "false");
    });
  };

  const applyLanguage = (language) => {
    const activeLanguage = labels[language] ? language : "pt";
    document.documentElement.lang = htmlLang[activeLanguage];

    selectors.forEach((selector) => {
      selector.querySelector(".language-current").textContent = labels[activeLanguage];
      selector.querySelectorAll("[data-lang]").forEach((option) => {
        option.classList.toggle("active", option.dataset.lang === activeLanguage);
      });
    });

    saveLanguage(activeLanguage);
  };

  applyLanguage(getSavedLanguage());

  selectors.forEach((selector) => {
    const trigger = selector.querySelector(".language-button");

    trigger?.addEventListener("click", (event) => {
      event.stopPropagation();
      const isOpen = selector.classList.contains("open");
      closeAll();
      selector.classList.toggle("open", !isOpen);
      trigger.setAttribute("aria-expanded", String(!isOpen));
    });

    selector.querySelectorAll("[data-lang]").forEach((option) => {
      option.addEventListener("click", () => {
        applyLanguage(option.dataset.lang);
        closeAll();
      });
    });
  });

  document.addEventListener("click", closeAll);
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeAll();
    }
  });
})();

/* Melhorias globais de UX, acessibilidade e resiliência. */
(() => {
  const placeholder = "./assets/figma/product-placeholder.svg";
  const productImages = {
    "produto-medicube-zero-pore-pad-mild.html": "./assets/figma/hero-products/medicube-zero-pore-pad-mild.png",
    "produto-gold-standard-whey.html": "./assets/figma/hero-products/gold-standard-whey.png",
    "produto-c4-original.html": "./assets/figma/hero-products/c4-original.png",
    "produto-gnc-mega-men-sport-multivitamin.html": "./assets/figma/hero-products/gnc-mega-men-sport.png",
    "produto-osteo-bi-flex-joint-health-triple-strength.html": "./assets/figma/hero-products/osteo-bi-flex-triple-strength.png",
    "produto-slimex-15mg-4x.html": "./assets/figma/pages/product-slimex-main.png",
    "produto-slimex-15mg-md.html": "./assets/figma/catalog/cat-emag-01.png",
    "produto-tg-10mg.html": "./assets/figma/catalog/cat-emag-03.png",
    "produto-tg-15mg.html": "./assets/figma/catalog/cat-emag-04.png",
    "produto-tirzec-15mg-1x.html": "./assets/figma/catalog/cat-emag-05.png",
    "produto-tirzec-pen-15mg.html": "./assets/figma/catalog/cat-emag-06.png",
    "produto-dysport-500ui.html": "./assets/figma/catalog/cat-est-01.png",
    "produto-israderm-100ui.html": "./assets/figma/catalog/cat-est-02.png",
    "produto-israderm-150ui.html": "./assets/figma/catalog/cat-est-03.png",
    "produto-hutox-100ui.html": "./assets/figma/catalog/cat-est-04.png",
    "produto-synedica-labs-nad-plus.html": "./assets/figma/catalog/cat-est-05.png",
    "produto-oxygen-nad-plus-b12-1000mg.html": "./assets/figma/catalog/cat-est-06.png",
    "produto-bpc-157-10mg.html": "./assets/figma/catalog/cat-pep-01.png",
    "produto-ghk-cu-100mg.html": "./assets/figma/catalog/cat-pep-02.png",
    "produto-tb-500-10mg.html": "./assets/figma/catalog/cat-pep-03.png",
    "produto-nad-plus-500mg.html": "./assets/figma/catalog/cat-pep-04.png",
    "produto-klow-80mg.html": "./assets/figma/catalog/cat-pep-05.png",
    "produto-ipamorelin.html": "./assets/figma/catalog/cat-pep-06.png",
    "produto-reta-usa-peptides-40mg.html": "./assets/figma/catalog/cat-reta-01.png",
    "produto-usa-tirzepatida-30mg.html": "./assets/figma/catalog/cat-reta-02.png",
    "produto-nexxus-retatrutida-40mg.html": "./assets/figma/catalog/cat-reta-03.png",
    "produto-synedica-reta-verde-40mg.html": "./assets/figma/catalog/cat-reta-04.png",
    "produto-alluvi-reta-40mg.html": "./assets/figma/catalog/cat-reta-05.png",
    "produto-oxygen-retagen-40mg.html": "./assets/figma/catalog/cat-reta-06.png",
    "produto-nad.html": "./assets/figma/catalog/cat-all-05.png",
    "produto-tb-500.html": "./assets/figma/catalog/cat-all-06.png",
    "produto-glow.html": "./assets/figma/catalog/cat-all-07.png",
    "produto-kpv.html": "./assets/figma/catalog/cat-all-08.png",
    "produto-bpc-157.html": "./assets/figma/catalog/cat-all-09.png",
    "produto-ss-31.html": "./assets/figma/catalog/cat-all-10.png",
    "produto-ghk-cu.html": "./assets/figma/catalog/cat-all-11.png",
    "produto-pt-141.html": "./assets/figma/catalog/cat-all-12.png",
    "produto-mostc.html": "./assets/figma/product-mostc.png",
    "produto-tb-500-bpc-157.html": "./assets/figma/product-tb500-bpc157.png",
    "produto-hgh-fragment-176-191.html": "./assets/figma/product-hgh-fragment.png",
    "produto-klow.html": "./assets/figma/product-klow.png"
  };

  const resolveProductImage = (file) => {
    if (productImages[file]) return productImages[file];
    return null;
  };

  const pageFile = window.location.pathname.split("/").pop() || "index.html";
  const currentProductImage = resolveProductImage(pageFile);
  if (currentProductImage) {
    document.querySelectorAll(".product-main-image img, .product-thumbs img").forEach((image) => {
      image.src = currentProductImage;
      image.dataset.productImage = "mapped";
    });
  }

  document.querySelectorAll(".catalog-card, .product-card").forEach((card) => {
    const productLink = card.querySelector('a[href*="produto-"]');
    const image = card.querySelector("img");
    if (!productLink || !image) return;
    const linkedFile = new URL(productLink.href, window.location.href).pathname.split("/").pop();
    const mappedImage = resolveProductImage(linkedFile);
    if (!mappedImage) return;
    image.src = mappedImage;
    image.dataset.productImage = "mapped";
  });

  document.querySelectorAll("img").forEach((image) => {
    const applyFallback = () => {
      if (image.dataset.fallbackApplied || image.src.endsWith("product-placeholder.svg")) return;
      image.dataset.fallbackApplied = "true";
      image.src = placeholder;
      image.classList.add("image-fallback");
      if (!image.alt) image.alt = "Imagem do produto em atualização";
    };
    image.addEventListener("error", applyFallback);
    if (image.complete && image.naturalWidth === 0) applyFallback();
  });

  document.querySelectorAll(".language-selector").forEach((selector) => {
    const button = selector.querySelector(".language-button");
    selector.querySelector(".language-menu")?.remove();
    button?.setAttribute("aria-label", "Idioma do site: Português");
    button?.setAttribute("title", "Conteúdo disponível em português");
    if (button) button.disabled = true;
  });

  document.querySelectorAll('a[href="#"]').forEach((link) => {
    link.setAttribute("aria-disabled", "true");
    link.setAttribute("title", "Conteúdo em atualização");
    link.addEventListener("click", (event) => event.preventDefault());
  });

  const pageHeading = document.querySelector("main h1");
  if (pageHeading && document.title.trim() === "Bymac Pharmacon") {
    document.title = `${pageHeading.textContent.trim()} | Bymac Pharmacon`;
  }
  if (!document.querySelector('meta[name="description"]') && pageHeading) {
    const description = document.createElement("meta");
    description.name = "description";
    description.content = `Conheça ${pageHeading.textContent.trim()} na curadoria Bymac Pharmacon e fale com nossa equipe para saber mais.`;
    document.head.append(description);
  }

  document.querySelectorAll('a[href^="https://wa.me/"]').forEach((link) => {
    const productName = pageHeading?.textContent.trim();
    if (!productName || link.href.includes("?text=")) return;
    const message = `Olá! Gostaria de saber mais sobre ${productName}.`;
    link.href = `${link.href}?text=${encodeURIComponent(message)}`;
    link.setAttribute("aria-label", `Consultar ${productName} pelo WhatsApp`);
  });

  document.querySelectorAll(".cta-art").forEach((art) => {
    const ring = art.querySelector(".cta-ring");
    if (ring) ring.src = "./assets/figma/sections/cta-ring.svg";

    let product = art.querySelector(".cta-product");
    if (!product) {
      const existingImage = Array.from(art.children).find((child) => child.tagName === "IMG" && !child.classList.contains("cta-ring"));
      product = document.createElement("div");
      product.className = "cta-product";
      if (existingImage) existingImage.replaceWith(product);
      else art.append(product);
    }

    let productImage = product.querySelector("img");
    if (!productImage) {
      productImage = document.createElement("img");
      product.append(productImage);
    }
    productImage.src = "./assets/figma/sections/cta-vitamin-e-400-transparent.png";
    productImage.alt = "";
  });

  const header = document.querySelector(".site-header");
  const nav = header?.querySelector(".main-nav");
  const tools = header?.querySelector(".header-tools");
  if (header && nav && !header.querySelector(".mobile-menu-toggle")) {
    const grid = header.querySelector(".site-header-grid");
    const toggle = document.createElement("button");
    toggle.className = "mobile-menu-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-label", "Abrir menu");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = "<span></span><span></span><span></span>";
    const panel = document.createElement("div");
    panel.className = "header-menu-panel";
    grid.append(toggle, panel);
    panel.append(nav);
    if (tools) panel.append(tools);

    const close = () => {
      header.classList.remove("menu-open");
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menu");
    };
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") !== "true";
      header.classList.toggle("menu-open", open);
      toggle.setAttribute("aria-expanded", String(open));
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    });
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) close();
    });
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });
  }

  const catalogTabs = document.querySelector(".catalog-tabs");
  if (catalogTabs && !document.querySelector("#catalog-search")) {
    const tools = document.createElement("div");
    tools.className = "catalog-tools";
    tools.setAttribute("role", "search");
    tools.setAttribute("aria-label", "Buscar no catálogo");
    tools.innerHTML = '<label for="catalog-search">Encontre um produto</label><div class="catalog-search-row"><input id="catalog-search" type="search" placeholder="Busque por nome, marca ou finalidade" autocomplete="off"><span class="catalog-result-count" aria-live="polite"></span></div>';
    catalogTabs.after(tools);
    const group = document.querySelector(".catalog-group");
    const empty = document.createElement("div");
    empty.className = "catalog-empty";
    empty.hidden = true;
    empty.innerHTML = "<strong>Nenhum produto encontrado</strong><p>Tente outro nome ou explore as categorias acima.</p>";
    group?.append(empty);
  }

  const search = document.querySelector("#catalog-search");
  if (search) {
    const cards = Array.from(document.querySelectorAll(".catalog-card"));
    const count = document.querySelector(".catalog-result-count");
    const empty = document.querySelector(".catalog-empty");
    const normalize = (value) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    const update = () => {
      const term = normalize(search.value);
      let visible = 0;
      cards.forEach((card) => {
        const matches = !term || normalize(card.textContent).includes(term);
        card.hidden = !matches;
        if (matches) visible += 1;
      });
      count.textContent = `${visible} ${visible === 1 ? "produto" : "produtos"}`;
      empty.hidden = visible !== 0;
    };
    search.addEventListener("input", update);
    update();
  }
})();
