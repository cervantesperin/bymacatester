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
