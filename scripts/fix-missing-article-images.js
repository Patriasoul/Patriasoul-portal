const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const DATA = path.join(ROOT, "assets/js/content-data.js");
const IMAGE_DIR = path.join(ROOT, "assets/images/articles");

function escXml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function escHtml(value) {
  return String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function makeSvg(title, category, index) {
  const safeTitle = escXml(title);
  const safeCategory = escXml(category || "PatriaSoul");
  const hue = index % 2 ? "#0b2d59" : "#071f3d";
  const accent = index % 3 === 0 ? "#c8102e" : "#e7edf5";
  const stripe = index % 4;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" role="img" aria-labelledby="t d">
<title id="t">\${safeTitle}</title>
<desc id="d">PatriaSoul urednička ilustracija za temu: \${safeTitle}</desc>
<rect width="1600" height="900" fill="\${hue}"/>
<rect width="1600" height="900" fill="none" stroke="#ffffff" stroke-opacity=".10" stroke-width="4"/>
<path d="M0 \${180 + stripe * 35} L1600 \${40 + stripe * 35} L1600 250 L0 390 Z" fill="#c8102e" opacity=".92"/>
<path d="M0 500 L1600 360 L1600 470 L0 610 Z" fill="#ffffff" opacity=".94"/>
<path d="M0 640 L1600 500 L1600 900 L0 900 Z" fill="#0b2d59" opacity=".92"/>
<g opacity=".13" fill="#fff">
<path d="M0 0h80v80H0zM160 0h80v80h-80zM320 0h80v80h-80zM480 0h80v80h-80zM640 0h80v80h-80zM800 0h80v80h-80zM960 0h80v80h-80zM1120 0h80v80h-80zM1280 0h80v80h-80zM1440 0h80v80h-80z"/>
<path d="M80 80h80v80H80zM240 80h80v80h-80zM400 80h80v80h-80zM560 80h80v80h-80zM720 80h80v80h-80zM880 80h80v80h-80zM1040 80h80v80h-80zM1200 80h80v80h-80zM1360 80h80v80h-80zM1520 80h80v80h-80z"/>
</g>
<text x="90" y="105" fill="#fff" font-family="Arial,Helvetica,sans-serif" font-size="28" font-weight="700" letter-spacing="5">PATRIASOUL · ČUVARI NASLJEĐA</text>
<text x="90" y="660" fill="\${accent}" font-family="Arial,Helvetica,sans-serif" font-size="30" font-weight="700" letter-spacing="3">\${safeCategory.toUpperCase()}</text>
<foreignObject x="90" y="700" width="1420" height="150">
<div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial,Helvetica,sans-serif;color:#fff;font-size:44px;font-weight:800;line-height:1.08;">\${safeTitle}</div>
</foreignObject>
</svg>`;
}
function parseData(src) {
  const expression = src.replace(/^\\s*window\\.PatriaSoulContent\\s*=\\s*/, "return ");
  return new Function(expression)();
}
function findExistingImage(html) {
  const m = html.match(/<img\\b[^>]*\\bsrc=["']([^"']+)["']/i);
  return m ? m[1] : null;
}

let dataSource = fs.readFileSync(DATA, "utf8");
const data = parseData(dataSource);
const articles = data.articles || {};
fs.mkdirSync(IMAGE_DIR, { recursive: true });
const changed = [];
let svgCount = 0;

for (const [key, article] of Object.entries(articles)) {
  if (article.image) continue;
  const pagePath = path.join(ROOT, article.url);
  if (!fs.existsSync(pagePath)) continue;
  let html = fs.readFileSync(pagePath, "utf8");
  const existing = findExistingImage(html);
  if (existing) {
    article.image = existing;
    article.imageAlt = article.title;
    article.imageCaption = "Fotografija korištena na članku; provjera izvora i licence ostaje dio uredničke obrade.";
    changed.push(article.url);
    continue;
  }
  const fileName = key.replace(/[^a-z0-9_-]+/gi, "-").toLowerCase() + ".svg";
  const rel = "assets/images/articles/" + fileName;
  const abs = path.join(IMAGE_DIR, fileName);
  fs.writeFileSync(abs, makeSvg(article.title, article.category, svgCount + 1), "utf8");
  svgCount++;
  article.image = rel;
  article.imageAlt = article.title;
  article.imageCaption = "PatriaSoul urednička ilustracija izrađena za ovu priču. Ilustracija nije povijesna fotografija niti dokumentarni dokaz.";
  if (!/<img\\b/i.test(html)) {
    const figure = `<figure class="article-figure"><img class="article-hero" src="\${rel}" alt="\${escHtml(article.title)}" loading="eager" decoding="async"><figcaption>\${escHtml(article.imageCaption)}</figcaption></figure>`;
    if (/<div class="article-meta"[^>]*>[\\s\\S]*?<\\/div>/i.test(html)) {
      html = html.replace(/(<div class="article-meta"[^>]*>[\\s\\S]*?<\\/div>)/i, "$1" + figure);
    } else {
      html = html.replace(/(<p class="article-deck"[^>]*>[\\s\\S]*?<\\/p>)/i, "$1" + figure);
    }
    fs.writeFileSync(pagePath, html, "utf8");
    changed.push(article.url);
  }
}

for (const [key, article] of Object.entries(articles)) {
  if (!article.image) continue;
  const escaped = key.replace(/[.*+?^\\\${}()|[\\]\\\\]/g, "\\\\$&");
  const re = new RegExp("(?:[\\\\\\\"']" + escaped + "[\\\\\\\"']|" + escaped + ")\\\\s*:\\\\s*\\\\{");
  if (!re.test(dataSource)) continue;
  const imageLine = "image:" + JSON.stringify(article.image) + ", imageAlt:" + JSON.stringify(article.imageAlt || article.title) + ", imageCaption:" + JSON.stringify(article.imageCaption || "") + ", ";
  if (!new RegExp("(?:[\\\\\\\"']" + escaped + "[\\\\\\\"']|" + escaped + ")\\\\s*:\\\\s*\\\\{[^}]*\\\\bimage\\\\s*:").test(dataSource)) {
    dataSource = dataSource.replace(re, (m) => m + "\\n      " + imageLine);
  }
}
fs.writeFileSync(DATA, dataSource, "utf8");
console.log("PatriaSoul missing-image repair");
console.log("Articles with images after repair:", Object.values(articles).filter(a => a.image).length);
console.log("New local SVG covers:", svgCount);
console.log("Updated article pages:", changed.length);
