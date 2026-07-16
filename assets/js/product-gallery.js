const centerVisibleProduct = async (image) => {
  try {
    if (!image.complete) await new Promise((resolve) => image.addEventListener("load", resolve, { once: true }));
    if (image.decode) await image.decode().catch(() => {});
    if (!image.naturalWidth || !image.naturalHeight) return;

    const sampleScale = Math.min(1, 512 / Math.max(image.naturalWidth, image.naturalHeight));
    const width = Math.max(1, Math.round(image.naturalWidth * sampleScale));
    const height = Math.max(1, Math.round(image.naturalHeight * sampleScale));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0, width, height);
    const pixels = context.getImageData(0, 0, width, height).data;

    let minX = width;
    let minY = height;
    let maxX = -1;
    let maxY = -1;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (pixels[(y * width + x) * 4 + 3] < 18) continue;
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    }
    if (maxX < minX || maxY < minY) return;

    const style = getComputedStyle(image);
    const contentWidth = image.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const contentHeight = image.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
    const renderedScale = Math.min(contentWidth / width, contentHeight / height);
    const visibleCenterX = (minX + maxX) / 2;
    const visibleCenterY = (minY + maxY) / 2;
    const offsetX = (width / 2 - visibleCenterX) * renderedScale;
    const offsetY = (height / 2 - visibleCenterY) * renderedScale;

    image.style.removeProperty("transform");
    image.style.setProperty("--visual-offset-x", `${offsetX.toFixed(2)}px`);
    image.style.setProperty("--visual-offset-y", `${offsetY.toFixed(2)}px`);
  } catch (_) {
    image.style.removeProperty("--visual-offset-x");
    image.style.removeProperty("--visual-offset-y");
  }
};

document.querySelectorAll(".packshot-image img, .packshot-thumbs img, .product-image img").forEach(centerVisibleProduct);

document.querySelectorAll(".product-gallery").forEach((gallery) => {
  const main = gallery.querySelector(".product-main-image img");
  const buttons = gallery.querySelectorAll(".product-thumbs button");
  if (!main || buttons.length === 0) return;

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const img = button.querySelector("img");
      if (!img) return;
      main.addEventListener("load", () => centerVisibleProduct(main), { once: true });
      main.src = img.src;
      buttons.forEach((item) => item.classList.remove("active"));
      button.classList.add("active");
    });
  });
});
