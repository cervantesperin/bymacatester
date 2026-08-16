(() => {
  const header = document.querySelector(".site-header");
  const grid = header?.querySelector(".site-header-grid");
  const navigation = grid?.querySelector(".main-nav");
  const tools = grid?.querySelector(".header-tools");

  if (!header || !grid || !navigation) return;

  let toggle = grid.querySelector(".mobile-menu-toggle");
  if (!toggle) {
    toggle = document.createElement("button");
    toggle.className = "mobile-menu-toggle";
    toggle.type = "button";
    toggle.setAttribute("aria-label", "Abrir menu");
    toggle.setAttribute("aria-expanded", "false");
    toggle.innerHTML = "<span></span><span></span><span></span>";
    grid.querySelector(".brand")?.after(toggle);
  }

  let panel = grid.querySelector(".header-menu-panel");
  if (!panel) {
    panel = document.createElement("div");
    panel.className = "header-menu-panel";
    toggle.after(panel);
    panel.append(navigation);
    if (tools) panel.append(tools);
  }

  panel.id ||= "mobile-header-menu";
  toggle.setAttribute("aria-controls", panel.id);

  const closeMenu = () => {
    header.classList.remove("menu-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Abrir menu");
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    header.classList.toggle("menu-open", !isOpen);
    toggle.setAttribute("aria-expanded", String(!isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Abrir menu" : "Fechar menu");
  });

  navigation.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMenu();
  });

  document.addEventListener("click", (event) => {
    if (!header.contains(event.target)) closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });

  const desktopQuery = window.matchMedia("(min-width: 721px)");
  desktopQuery.addEventListener?.("change", closeMenu);
  window.addEventListener("pageshow", closeMenu);
  closeMenu();
})();
