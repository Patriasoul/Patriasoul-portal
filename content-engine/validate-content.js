#!/usr/bin/env node

const fs = require("fs");
const vm = require("vm");
const path = require("path");

const repoRoot = path.resolve(__dirname, "..");
const contentFile = path.join(repoRoot, "assets", "js", "content-data.js");
const source = fs.readFileSync(contentFile, "utf8");
const context = { window: {} };
vm.runInNewContext(source, context, { filename: contentFile });

const articles = context.window.PatriaSoulContent?.articles;
if (!articles || typeof articles !== "object") throw new Error("PatriaSoulContent.articles nije pronađen.");

const required = ["title", "date", "url", "category", "deck"];
const seenUrls = new Map();
const seenTitles = new Map();
const errors = [];

for (const [key, article] of Object.entries(articles)) {
  if (!article || typeof article !== "object") {
    errors.push(key + ": članak nije objekt.");
    continue;
  }

  for (const field of required) {
    if (typeof article[field] !== "string" || !article[field].trim()) {
      errors.push(key + ': nedostaje obavezno polje "' + field + '".');
    }
  }

  if (article.date && !/^\d{4}-\d{2}-\d{2}$/.test(article.date)) {
    errors.push(key + ": datum nije u formatu YYYY-MM-DD.");
  }

  if (article.url) {
    if (seenUrls.has(article.url)) {
      errors.push(key + ': dupli URL "' + article.url + '" — već koristi ' + seenUrls.get(article.url) + ".");
    } else seenUrls.set(article.url, key);
  }

  if (article.title) {
    const normalized = article.title.trim().toLocaleLowerCase("hr-HR");
    if (seenTitles.has(normalized)) {
      errors.push(key + ": dupli naslov — već koristi " + seenTitles.get(normalized) + ".");
    } else seenTitles.set(normalized, key);
  }

  if (article.tags && !Array.isArray(article.tags)) errors.push(key + ": tags mora biti polje.");
}

console.log("PatriaSoul Content Engine: provjereno " + Object.keys(articles).length + " članaka.");

if (errors.length) {
  console.error("\nGREŠKE:");
  errors.forEach(error => console.error("- " + error));
  process.exit(1);
}

console.log("OK — postojeći sadržaj prolazi osnovnu validaciju.");
