#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const [, , inputFile, outputDir = "content-engine/test-output"] = process.argv;
if (!inputFile) { console.error("Usage: node content-engine/generate-article.js <article.json> [output-dir]"); process.exit(1); }
const inputPath = path.resolve(inputFile);
const data = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const required = ["slug", "title", "category", "date", "deck", "content", "sources"];
for (const key of required) if (!(key in data)) throw new Error("Missing required field: " + key);
if (!/^\\d{4}-\\d{2}-\\d{2}$/.test(data.date)) throw new Error("Invalid date; expected YYYY-MM-DD");
if (!Array.isArray(data.sources) || data.sources.length === 0) throw new Error("At least one source is required");
if (!data.sources.every(s => s && s.title && /^https?:\\/\\//.test(s.url))) throw new Error("Every source needs title and http(s) URL");
const escapeHtml = value => String(value).replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll(""","&quot;").replaceAll("'","&#39;");
const content = Array.isArray(data.content) ? data.content : [data.content];
const contentHtml = content.map(p => "<p>" + escapeHtml(p) + "</p>").join("\n");
const sourcesHtml = data.sources.map(s => "<li><a href=\"" + escapeHtml(s.url) + "\" rel=\"noopener noreferrer\">" + escapeHtml(s.title) + "</a></li>").join("\n");
const html = "<!doctype html>\n<html lang=\"hr\">\n<head>\n<meta charset=\"utf-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n<title>" + escapeHtml(data.title) + " · PatriaSoul</title>\n<meta name=\"description\" content=\"" + escapeHtml(data.deck) + "\">\n</head>\n<body>\n<main>\n<article data-content-engine=\"v2\">\n<header><p>" + escapeHtml(data.category) + " · " + escapeHtml(data.date) + "</p><h1>" + escapeHtml(data.title) + "</h1><p>" + escapeHtml(data.deck) + "</p></header>\n<section>\n" + contentHtml + "\n</section>\n<footer><h2>Izvori</h2><ul>\n" + sourcesHtml + "\n</ul></footer>\n</article>\n</main>\n</body>\n</html>\n";
const outDir = path.resolve(outputDir);
fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, data.slug + ".html");
fs.writeFileSync(outPath, html, "utf8");
console.log("Generated: " + path.relative(process.cwd(), outPath));