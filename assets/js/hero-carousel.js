(() => {
  const hero = document.querySelector(".hero");
  if (!hero) return;

  const slides = [...hero.querySelectorAll(".hero-slide")];
  const dots = [...hero.querySelectorAll(".hero-dots button")];
  const previous = hero.querySelector(".hero-arrow-left");
  const next = hero.querySelector(".hero-arrow-right");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let current = 0;
  let timer = null;
  let touchStartX = 0;

  const show = (index, userInitiated = false) => {
    current = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const active = slideIndex === current;
      slide.classList.toggle("active", active);
      slide.setAttribute("aria-hidden", String(!active));
      const link = slide.querySelector("a");
      if (link) link.tabIndex = active ? 0 : -1;
    });

    dots.forEach((dot, dotIndex) => {
      const active = dotIndex === current;
      dot.classList.toggle("active", active);
      if (active) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });

    const accent = getComputedStyle(slides[current]).getPropertyValue("--accent").trim();
    hero.style.setProperty("--active-dot", accent || "#ffffff");
    if (userInitiated) restart();
  };

  const stop = () => {
    window.clearInterval(timer);
    timer = null;
  };

  const start = () => {
    stop();
    if (reduceMotion.matches || document.hidden) return;
    timer = window.setInterval(() => show(current + 1), 6500);
  };

  const restart = () => {
    stop();
    start();
  };

  previous?.addEventListener("click", () => show(current - 1, true));
  next?.addEventListener("click", () => show(current + 1, true));
  dots.forEach((dot, index) => dot.addEventListener("click", () => show(index, true)));

  hero.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") show(current - 1, true);
    if (event.key === "ArrowRight") show(current + 1, true);
  });
  hero.addEventListener("mouseenter", stop);
  hero.addEventListener("mouseleave", start);
  hero.addEventListener("focusin", stop);
  hero.addEventListener("focusout", (event) => {
    if (!hero.contains(event.relatedTarget)) start();
  });
  hero.addEventListener("touchstart", (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });
  hero.addEventListener("touchend", (event) => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) > 45) show(current + (distance < 0 ? 1 : -1), true);
  }, { passive: true });

  document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
  reduceMotion.addEventListener?.("change", start);
  show(0);
  start();
})();
