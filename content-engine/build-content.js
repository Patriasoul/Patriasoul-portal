#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const inputDir = path.resolve(process.argv[2] || "content-engine/articles");
const outputFile = path.resolve(process.argv[3] || "content-engine/generated/generated-content.js");

const files = fs.readdirSync(inputDir).filter(f => f.endsWith(".json")).sort();
const articles = files.map(file => {
  const article = JSON.parse(fs.readFileSync(path.join(inputDir, file), "utf8"));
  const required = ["slug","title","category","date","deck","content","sources"];
  for (const key of required) if (!(key in article)) throw new Error(file + ": missing " + key);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(article.date)) throw new Error(file + ": invalid date");
  if (!Array.isArray(article.sources) || article.sources.length === 0) throw new Error(file + ": sources required");
  return article;
});

const js = "window.PatriaSoulGeneratedContent = " + JSON.stringify({articles}, null, 2) + ";\n";
fs.mkdirSync(path.dirname(outputFile), {recursive:true});
fs.writeFileSync(outputFile, js, "utf8");
console.log("Generated " + outputFile + " from " + files.length + " article(s).");
