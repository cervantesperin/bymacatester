const revealTargets = [
  ...document.querySelectorAll(
    "main > section:not(.hero), .products-grid, .catalog-grid, .benefit-grid, .feature-grid, .footer > *"
  ),
].filter((element, index, elements) =>
  !elements.some((parent, parentIndex) => parentIndex < index && parent.contains(element))
);

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduceMotion && revealTargets.length) {
  const supportsViewTimeline = CSS.supports("animation-timeline: view()");

  if (supportsViewTimeline) {
    revealTargets.forEach((element) => element.classList.add("scroll-reveal-native"));
  } else {
    revealTargets.forEach((element) => element.classList.add("scroll-reveal-fallback"));
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-revealed");
          observer.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 }
    );
    revealTargets.forEach((element) => observer.observe(element));
  }
}
