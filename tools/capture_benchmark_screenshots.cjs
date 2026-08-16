const fs = require("node:fs/promises");
const path = require("node:path");
const { chromium } = require("/Users/vinicioscervantes/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const root = "/Users/vinicioscervantes/Documents/Bymac Pharm";
const outRoot = path.join(root, "benchmark_screenshots");

const players = [
  { key: "ueno", name: "ueno bank", country: "Paraguai", group: "paraguay", url: "https://www.ueno.com.py/", productHints: ["agro", "empresas", "personas", "productos"] },
  { key: "eko", name: "Eko", country: "Paraguai", group: "paraguay", url: "https://www.eko.com.py/", productHints: ["app", "cuenta", "tarjeta"] },
  { key: "tigo_money", name: "Tigo Money Paraguay", country: "Paraguai", group: "paraguay", url: "https://www.tigomoney.com/home-py/", productHints: ["giros", "pagos", "app"] },
  { key: "continental", name: "Banco Continental", country: "Paraguai", group: "paraguay", url: "https://www.bancontinental.com.py/", productHints: ["agro", "empresas", "personas"] },
  { key: "sudameris", name: "Sudameris", country: "Paraguai", group: "paraguay", url: "https://www.sudameris.com.py/", productHints: ["agro", "empresas", "personas"] },
  { key: "itau_py", name: "Itaú Paraguay", country: "Paraguai", group: "paraguay", url: "https://www.itau.com.py/", productHints: ["agro", "empresas", "personas"] },
  { key: "basa", name: "Banco Basa", country: "Paraguai", group: "paraguay", url: "https://www.bancobasa.com.py/", productHints: ["agro", "empresas", "personas"] },
  { key: "bancop", name: "Bancop", country: "Paraguai", group: "paraguay", url: "https://www.bancop.com.py/", productHints: ["agro", "empresas", "personas"] },
  { key: "nubank", name: "Nubank", country: "Brasil", group: "brasil", url: "https://nubank.com.br/", productHints: ["conta", "cartao", "emprestimo"] },
  { key: "inter", name: "Inter", country: "Brasil", group: "brasil", url: "https://www.inter.co/pra-voce/conta-digital/pessoa-fisica/", productHints: ["conta-digital", "cartao", "investimentos"] },
  { key: "picpay", name: "PicPay", country: "Brasil", group: "brasil", url: "https://picpay.com/pt-br/pf", productHints: ["conta", "cartao", "emprestimo"] },
  { key: "c6", name: "C6 Bank", country: "Brasil", group: "brasil", url: "https://www.c6bank.com.br/", productHints: ["conta", "cartao", "empresas"] },
  { key: "sicredi", name: "Sicredi", country: "Brasil", group: "brasil", url: "https://www.sicredi.com.br/home/", productHints: ["agronegocio", "credito-rural", "produtor-rural"] },
  { key: "banco_do_brasil_agro", name: "Banco do Brasil Agro", country: "Brasil", group: "brasil", url: "https://www.bb.com.br/site/agronegocios/", productHints: ["agronegocios", "credito-rural", "custeio"] },
  { key: "broto", name: "Broto", country: "Brasil", group: "brasil", url: "https://broto.com.br/", productHints: ["credito", "maquinas", "agro"] },
];

const cookieSelectors = [
  "button:has-text('Aceitar')",
  "button:has-text('Aceito')",
  "button:has-text('Accept')",
  "button:has-text('Aceptar')",
  "button:has-text('Concordo')",
  "button:has-text('Permitir')",
  "button:has-text('OK')",
  "button:has-text('Entendi')",
  "text=Aceitar todos",
  "text=Aceptar todas",
  "text=Accept all",
  "[aria-label*='close' i]",
  "[aria-label*='fechar' i]",
  "[aria-label*='cerrar' i]",
  ".modal button.close",
  ".cookie button",
];

const menuSelectors = [
  "button[aria-label*='menu' i]",
  "button[aria-label*='Menu' i]",
  "button:has-text('Menu')",
  "button:has-text('Produtos')",
  "button:has-text('Servicios')",
  "button:has-text('Para você')",
  "button:has-text('Personas')",
  "button:has-text('Empresas')",
  "a:has-text('Menu')",
  ".hamburger",
  ".navbar-toggler",
  ".menu-toggle",
  "[data-testid*='menu' i]",
];

function dirFor(player) {
  return path.join(outRoot, player.group, player.key);
}

async function ensureDir(player) {
  await fs.mkdir(dirFor(player), { recursive: true });
}

async function closeObstructions(page) {
  for (const selector of cookieSelectors) {
    try {
      const locator = page.locator(selector).first();
      if (await locator.isVisible({ timeout: 800 })) {
        await locator.click({ timeout: 1200 }).catch(() => {});
        await page.waitForTimeout(500);
      }
    } catch (_) {}
  }
}

async function gotoStable(page, url) {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForLoadState("networkidle", { timeout: 12000 }).catch(() => {});
  await page.waitForTimeout(1800);
  await closeObstructions(page);
}

async function safeText(page, selector) {
  try {
    return (await page.locator(selector).first().innerText({ timeout: 1500 })).replace(/\s+/g, " ").trim();
  } catch (_) {
    return "";
  }
}

async function summarizePage(page) {
  const title = await page.title().catch(() => "");
  const h1 = await safeText(page, "h1");
  const h2 = await safeText(page, "h2");
  const cta = await page
    .locator("a,button")
    .evaluateAll((els) =>
      els
        .map((el) => (el.innerText || el.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim())
        .filter((text) => text.length > 2 && text.length < 60)
        .slice(0, 10)
    )
    .catch(() => []);
  return { title, h1, h2, cta };
}

async function findProductUrl(page, player) {
  const links = await page
    .locator("a[href]")
    .evaluateAll((anchors) =>
      anchors.map((a) => ({
        text: (a.innerText || "").replace(/\s+/g, " ").trim(),
        href: a.href,
      }))
    )
    .catch(() => []);
  const sameHost = new URL(player.url).hostname.replace(/^www\./, "");
  const candidates = links.filter((l) => {
    try {
      const host = new URL(l.href).hostname.replace(/^www\./, "");
      return host.endsWith(sameHost) || sameHost.endsWith(host);
    } catch (_) {
      return false;
    }
  });
  const scored = candidates
    .map((l) => {
      const hay = `${l.text} ${l.href}`.toLowerCase();
      let score = 0;
      for (const hint of player.productHints) if (hay.includes(hint.toLowerCase())) score += 5;
      for (const generic of ["agro", "agroneg", "rural", "campo", "empresas", "empresa", "conta", "cuenta", "tarjeta", "cartao", "app", "credito", "crédito", "prestamo", "préstamo"]) {
        if (hay.includes(generic)) score += 1;
      }
      return { ...l, score };
    })
    .filter((l) => l.score > 0 && !l.href.includes("#"))
    .sort((a, b) => b.score - a.score);
  return scored[0]?.href || player.url;
}

async function capturePlayer(browser, player) {
  const status = {
    player: player.name,
    country: player.country,
    url: player.url,
    screenshots: [],
    productUrl: "",
    menuCaptured: false,
    problems: [],
    summary: {},
    productSummary: {},
  };
  await ensureDir(player);
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    deviceScaleFactor: 1,
    locale: player.country === "Brasil" ? "pt-BR" : "es-PY",
    ignoreHTTPSErrors: true,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(6000);
  try {
    await gotoStable(page, player.url);
    status.summary = await summarizePage(page);
    await page.screenshot({ path: path.join(dirFor(player), "home_first_fold.png"), fullPage: false });
    status.screenshots.push("home_first_fold.png");
    await page.screenshot({ path: path.join(dirFor(player), "home_fullpage.png"), fullPage: true });
    status.screenshots.push("home_fullpage.png");

    let menuOpened = false;
    for (const selector of menuSelectors) {
      try {
        const locator = page.locator(selector).first();
        if (await locator.isVisible({ timeout: 1000 })) {
          await locator.click({ timeout: 2000 });
          await page.waitForTimeout(1200);
          await closeObstructions(page);
          await page.screenshot({ path: path.join(dirFor(player), "menu_open.png"), fullPage: false });
          status.screenshots.push("menu_open.png");
          status.menuCaptured = true;
          menuOpened = true;
          break;
        }
      } catch (_) {}
    }
    if (!menuOpened) {
      status.problems.push("Menu principal não abriu por seletor automatizado.");
    }

    const productUrl = await findProductUrl(page, player);
    status.productUrl = productUrl;
    await gotoStable(page, productUrl);
    status.productSummary = await summarizePage(page);
    await page.screenshot({ path: path.join(dirFor(player), "product_or_agro_page.png"), fullPage: false });
    status.screenshots.push("product_or_agro_page.png");
  } catch (error) {
    status.problems.push(`Desktop/produto: ${error.message}`);
  } finally {
    await context.close();
  }

  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    deviceScaleFactor: 2,
    locale: player.country === "Brasil" ? "pt-BR" : "es-PY",
    ignoreHTTPSErrors: true,
  });
  const mobilePage = await mobileContext.newPage();
  mobilePage.setDefaultTimeout(6000);
  try {
    await gotoStable(mobilePage, player.url);
    await mobilePage.screenshot({ path: path.join(dirFor(player), "mobile_first_fold.png"), fullPage: false });
    status.screenshots.push("mobile_first_fold.png");
  } catch (error) {
    status.problems.push(`Mobile: ${error.message}`);
  } finally {
    await mobileContext.close();
  }
  return status;
}

function mdEscape(value) {
  return String(value || "").replace(/\|/g, "\\|").replace(/\n/g, " ");
}

async function writeReadme(results) {
  const lines = [
    "# Benchmark screenshots",
    "",
    "Capturas automatizadas feitas com Playwright em viewport desktop 1440x1000 e mobile 390x844.",
    "",
    "| Player | País | URL | Screenshots capturados | Página de produto/agro escolhida | Menu aberto | Problemas encontrados |",
    "| --- | --- | --- | --- | --- | --- | --- |",
  ];
  for (const r of results) {
    lines.push(`| ${mdEscape(r.player)} | ${mdEscape(r.country)} | ${mdEscape(r.url)} | ${mdEscape(r.screenshots.join(", "))} | ${mdEscape(r.productUrl)} | ${r.menuCaptured ? "Sim" : "Não"} | ${mdEscape(r.problems.join("; ") || "Nenhum bloqueio relevante")} |`);
  }
  await fs.writeFile(path.join(outRoot, "README.md"), `${lines.join("\n")}\n`);
  await fs.writeFile(path.join(outRoot, "capture_results.json"), JSON.stringify(results, null, 2));
}

async function main() {
  await fs.mkdir(outRoot, { recursive: true });
  const browser = await chromium.launch({
    headless: true,
    executablePath: path.join(root, ".pw-browsers/chromium-1223/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing"),
    args: ["--no-sandbox", "--disable-gpu"],
  });
  const results = [];
  for (const player of players) {
    console.log(`Capturing ${player.name}`);
    const result = await capturePlayer(browser, player);
    results.push(result);
    await writeReadme(results);
  }
  await browser.close();
  await writeReadme(results);
  console.log(`Done: ${results.length} players`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
