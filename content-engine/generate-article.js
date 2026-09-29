#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const inputPath =
  process.argv[2] || "content-engine/content-queue.json";

const outputDir =
  process.argv[3] || "content-engine/generated";

const AUTHOR = "PatriaSoul";

const ALLOWED_STATUSES = new Set([
  "TEST",
  "ZA PROVJERU"
]);

function esc(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function slugify(value) {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function requireField(object, key) {
  if (
    object[key] === undefined ||
    object[key] === null ||
    !String(object[key]).trim()
  ) {
    throw new Error(`Nedostaje: ${key}`);
  }
}

function getBodyText(article) {
  if (Array.isArray(article.body)) {
    return article.body
      .map(item => {
        if (!item) return "";

        if (item.text) return item.text;
        if (item.html) return item.html;

        return "";
      })
      .join(" ");
  }

  return String(article.body || "");
}

function wordCount(article) {
  const text = getBodyText(article)
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!text) return 0;

  return text
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

function validateArticle(article) {
  const requiredFields = [
    "title",
    "kicker",
    "deck",
    "date",
    "category",
    "type",
    "body",
    "sources"
  ];

  for (const field of requiredFields) {
    requireField(article, field);
  }

  if (
    article.author &&
    article.author !== AUTHOR
  ) {
    throw new Error(
      "Autor mora biti PatriaSoul."
    );
  }

  article.author = AUTHOR;

  if (!ALLOWED_STATUSES.has(article.status)) {
    throw new Error(
      'Status mora biti "TEST" ili "ZA PROVJERU".'
    );
  }

  if (
    !Array.isArray(article.sources) ||
    article.sources.length === 0
  ) {
    throw new Error(
      "Članak mora imati najmanje jedan izvor."
    );
  }

  for (const source of article.sources) {
    if (!source) {
      throw new Error(
        "Izvor ne smije biti prazan."
      );
    }

    if (typeof source === "string") {
      if (!source.trim()) {
        throw new Error(
          "Izvor ne smije biti prazan."
        );
      }
      continue;
    }

    if (typeof source === "object") {
      if (!source.title) {
        throw new Error(
          "Svaki izvor mora imati naslov."
        );
      }

      if (
        source.url &&
        !/^https?:\/\//i.test(source.url)
      ) {
        throw new Error(
          `Neispravan URL izvora: ${source.url}`
        );
      }
    }
  }

  if (
    article.status === "ZA PROVJERU" &&
    wordCount(article) < 1500
  ) {
    throw new Error(
      `Članak za uredničku provjeru mora imati najmanje 1500 riječi. Trenutno: ${wordCount(article)}.`
    );
  }

  if (
    /čuvari\s+nasljeđa/i.test(
      article.author
    )
  ) {
    throw new Error(
      "Neispravan autor: Čuvari nasljeđa nije autor."
    );
  }

  return article;
}

function renderSources(sources) {
  return sources
    .map(source => {
      if (typeof source === "string") {
        return `<p>• ${esc(source)}</p>`;
      }

      const title = esc(
        source.title || "Izvor"
      );

      if (source.url) {
        return `<p>• <a href="${esc(
          source.url
        )}" target="_blank" rel="noopener noreferrer">${title}</a></p>`;
      }

      return `<p>• ${title}</p>`;
    })
    .join("\n");
}

function renderBody(body) {
  if (!Array.isArray(body)) {
    return `<p>${esc(body)}</p>`;
  }

  return body
    .map(item => {
      if (!item) return "";

      if (item.type === "h2") {
        return `<h2>${esc(
          item.text || ""
        )}</h2>`;
      }

      if (item.type === "h3") {
        return `<h3>${esc(
          item.text || ""
        )}</h3>`;
      }

      if (item.type === "note") {
        return `
<div class="editorial-note">
  <strong>${esc(
    item.label || "DOKUMENTIRANO"
  )}</strong>
  <p>${esc(item.text || "")}</p>
</div>`;
      }

      if (item.html) {
        return `<div class="article-paragraph">${item.html}</div>`;
      }

      return `<p>${esc(
        item.text || ""
      )}</p>`;
    })
    .join("\n");
}

function renderArticle(article) {
  const metadata = [
    `Piše: ${AUTHOR}`,
    article.date,
    article.place || "",
    article.readingTime
      ? `${article.readingTime} min čitanja`
      : ""
  ]
    .filter(Boolean)
    .join(" · ");

  const image = article.image
    ? `
<figure class="article-figure">
  <img
    class="article-hero"
    src="${esc(article.image.url)}"
    alt="${esc(
      article.image.alt || article.title
    )}"
  >
  ${
    article.image.caption
      ? `<figcaption>${esc(
          article.image.caption
        )}</figcaption>`
      : ""
  }
</figure>`
    : "";

  return `<!doctype html>
<html lang="hr">
<head>
  <meta charset="utf-8">
  <meta
    name="viewport"
    content="width=device-width,initial-scale=1"
  >

  <title>${esc(
    article.title
  )} · PatriaSoul</title>

  <meta
    name="description"
    content="${esc(
      article.deck
    )}"
  >

  <link
    rel="stylesheet"
    href="../../assets/css/portal.css"
  >
</head>

<body>

<div
  style="
    background:#8b0000;
    color:#fff;
    padding:12px;
    text-align:center;
    font-weight:800;
  "
>
  AUTOMATSKI PRIPREMLJENO ·
  ${esc(article.status)}
  · NIJE JAVNA OBJAVA
</div>

<header class="site-header">
  <div class="topbar">

    <a
      class="brand"
      href="../../index.html"
    >
      <span class="brand-mark">🇭🇷</span>

      <span>
        <strong>PatriaSoul</strong>
        <small>Čuvari nasljeđa</small>
      </span>
    </a>

  </div>
</header>

<main class="article-page container">

  <div class="article-kicker">
    ${esc(article.kicker)}
  </div>

  <h1>
    ${esc(article.title)}
  </h1>

  <p class="article-deck">
    ${esc(article.deck)}
  </p>

  <div class="article-meta">
    ${esc(metadata)}
  </div>

  <div class="editorial-note">

    <strong>
      UREDNIČKI STATUS:
      ${esc(article.status)}
    </strong>

    <p>
      Autor:
      <strong>PatriaSoul</strong>.
      „Čuvari nasljeđa” može biti
      urednički format ili kategorija,
      ali nije autor.
    </p>

  </div>

  ${image}

  <div class="article-body">

    ${renderBody(article.body)}

    <h2>
      Izvori i literatura
    </h2>

    <div class="article-sources">
      ${renderSources(
        article.sources
      )}
    </div>

  </div>

</main>

<footer class="site-footer">

  <div class="container">

    <strong>
      PatriaSoul · Čuvari nasljeđa
    </strong>

    <p>
      Članak čeka uredničku provjeru.
    </p>

  </div>

</footer>

<script
  src="../../assets/js/portal.js"
></script>

</body>
</html>`;
}

function loadInput(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(
      `Ulazna datoteka ne postoji: ${filePath}`
    );
  }

  try {
    return JSON.parse(
      fs.readFileSync(
        filePath,
        "utf8"
      )
    );
  } catch (error) {
    throw new Error(
      `Neispravan JSON u ${filePath}: ${error.message}`
    );
  }
}

function getArticles(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (
    data &&
    Array.isArray(data.articles)
  ) {
    return data.articles;
  }

  throw new Error(
    "JSON mora sadržavati niz članaka."
  );
}

function main() {
  console.log(
    "PatriaSoul Content Engine"
  );

  console.log(
    "Ulaz:",
    inputPath
  );

  console.log(
    "Izlaz:",
    outputDir
  );

  const data =
    loadInput(inputPath);

  const articles =
    getArticles(data);

  if (!articles.length) {
    throw new Error(
      "Nema članaka za obradu."
    );
  }

  fs.mkdirSync(
    outputDir,
    { recursive: true }
  );

  const manifest = [];

  for (const article of articles) {
    validateArticle(article);

    const slug =
      article.slug ||
      slugify(article.title);

    if (!slug) {
      throw new Error(
        `Nije moguće napraviti slug za: ${article.title}`
      );
    }

    const filename =
      `${slug}.html`;

    const filePath =
      path.join(
        outputDir,
        filename
      );

    const html =
      renderArticle(article);

    fs.writeFileSync(
      filePath,
      html,
      "utf8"
    );

    const words =
      wordCount(article);

    manifest.push({
      slug,
      title: article.title,
      author: AUTHOR,
      status: article.status,
      category: article.category,
      type: article.type,
      words,
      file: filePath
    });

    console.log(
      `✓ ${article.title} (${words} riječi)`
    );
  }

  const manifestPath =
    path.join(
      outputDir,
      "manifest.json"
    );

  fs.writeFileSync(
    manifestPath,
    JSON.stringify(
      {
        generatedAt:
          new Date().toISOString(),
        author: AUTHOR,
        articles: manifest
      },
      null,
      2
    ),
    "utf8"
  );

  console.log(
    `Generirano: ${manifest.length} članaka`
  );

  console.log(
    `Manifest: ${manifestPath}`
  );
}

try {
  main();
} catch (error) {
  console.error(
    "ERROR:",
    error.message
  );

  process.exit(1);
}
