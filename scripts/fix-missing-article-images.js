const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const DATA = path.join(ROOT, "assets/js/content-data.js");
const IMAGE_DIR = path.join(ROOT, "assets/images/articles");

function escXml(v) {
  return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function escHtml(v) {
  return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function makeSvg(title, category, n) {
  const t = escXml(title);
  const c = escXml(category || "PatriaSoul");
  const blue = n % 2 ? "#0b2d59" : "#071f3d";
  const red = n % 3 ? "#c8102e" : "#9f0d25";
  const y = 160 + (n % 5) * 30;
  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1600 900" role="img" aria-labelledby="title desc">' +
    '<title id="title">' + t + '</title><desc id="desc">PatriaSoul urednička ilustracija za temu: ' + t + '</desc>' +
    '<rect width="1600" height="900" fill="' + blue + '"/>' +
    '<path d="M0 ' + y + ' L1600 35 L1600 250 L0 410 Z" fill="' + red + '"/>' +
    '<path d="M0 500 L1600 360 L1600 470 L0 610 Z" fill="#fff"/>' +
    '<path d="M0 650 L1600 510 L1600 900 L0 900 Z" fill="' + blue + '"/>' +
    '<g opacity=".12" fill="#fff"><path d="M0 0h80v80H0zM160 0h80v80h-80zM320 0h80v80h-80zM480 0h80v80h-80zM640 0h80v80h-80zM800 0h80v80h-80zM960 0h80v80h-80zM1120 0h80v80h-80zM1280 0h80v80h-80zM1440 0h80v80h-80z"/></g>' +
    '<text x="90" y="105" fill="#fff" font-family="Arial,Helvetica,sans-serif" font-size="28" font-weight="700" letter-spacing="5">PATRIASOUL · ČUVARI NASLJEĐA</text>' +
    '<text x="90" y="660" fill="' + red + '" font-family="Arial,Helvetica,sans-serif" font-size="30" font-weight="700" letter-spacing="3">' + c.toUpperCase() + '</text>' +
    '<foreignObject x="90" y="700" width="1420" height="150"><div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Arial,Helvetica,sans-serif;color:#fff;font-size:44px;font-weight:800;line-height:1.08;">' + t + '</div></foreignObject>' +
    '</svg>';
}
function parseData(src) {
  return new Function(src.replace(/^\s*window\.PatriaSoulContent\s*=\s*/, "return "))();
}
function existingImage(html) {
  const m = html.match(/<img[^>]*src=["']([^"']+)["']/i);
  return m ? m[1] : null;
}
function insertFigure(html, figure) {
  const metaStart = html.indexOf('<div class="article-meta"');
  if (metaStart >= 0) {
    const metaEnd = html.indexOf("</div>", metaStart);
    if (metaEnd >= 0) return html.slice(0, metaEnd + 6) + figure + html.slice(metaEnd + 6);
  }
  const deckStart = html.indexOf('<p class="article-deck"');
  if (deckStart >= 0) {
    const deckEnd = html.indexOf("</p>", deckStart);
    if (deckEnd >= 0) return html.slice(0, deckEnd + 4) + figure + html.slice(deckEnd + 4);
  }
  return html;
}

let dataSource = fs.readFileSync(DATA, "utf8");
const data = parseData(dataSource);
const articles = data.articles || {};
fs.mkdirSync(IMAGE_DIR, { recursive: true });

let svgCount = 0;
let pageCount = 0;
let registryCount = 0;

for (const [key, article] of Object.entries(articles)) {
  if (article.image) continue;
  const pagePath = path.join(ROOT, article.url);
  if (!fs.existsSync(pagePath)) continue;

  let html = fs.readFileSync(pagePath, "utf8");
  const existing = existingImage(html);

  if (existing) {
    article.image = existing;
    article.imageAlt = article.title;
    article.imageCaption = "Fotografija korištena na članku; provjera izvora i licence ostaje dio uredničke obrade.";
  } else {
    const fileName = key.replace(/[^a-z0-9_-]+/gi, "-").toLowerCase() + ".svg";
    article.image = "assets/images/articles/" + fileName;
    article.imageAlt = article.title;
    article.imageCaption = "PatriaSoul urednička ilustracija izrađena za ovu priču. Ilustracija nije povijesna fotografija niti dokumentarni dokaz.";
    fs.writeFileSync(path.join(IMAGE_DIR, fileName), makeSvg(article.title, article.category, ++svgCount), "utf8");
    const figure = '<figure class="article-figure"><img class="article-hero" src="' + article.image + '" alt="' + escHtml(article.title) + '" loading="eager" decoding="async"><figcaption>' + escHtml(article.imageCaption) + '</figcaption></figure>';
    if (!/<img/i.test(html)) {
      html = insertFigure(html, figure);
      fs.writeFileSync(pagePath, html, "utf8");
      pageCount++;
    }
  }

  const candidates = [key + ": {", '"' + key + '": {', "'" + key + "': {"];
  let pos = -1, marker = "";
  for (const candidate of candidates) {
    const p = dataSource.indexOf(candidate);
    if (p >= 0 && (pos < 0 || p < pos)) { pos = p; marker = candidate; }
  }
  if (pos >= 0) {
    const objectStart = pos + marker.length;
    const preview = dataSource.slice(objectStart, objectStart + 700);
    if (!/\bimage\s*:/.test(preview)) {
      const line = '\n      image:' + JSON.stringify(article.image) + ', imageAlt:' + JSON.stringify(article.imageAlt) + ', imageCaption:' + JSON.stringify(article.imageCaption) + ',';
      dataSource = dataSource.slice(0, objectStart) + line + dataSource.slice(objectStart);
      registryCount++;
    }
  }
}

fs.writeFileSync(DATA, dataSource, "utf8");
console.log("Articles with images:", Object.values(articles).filter(a => a.image).length);
console.log("New SVG covers:", svgCount);
console.log("Article pages updated:", pageCount);
console.log("Registry entries updated:", registryCount);
