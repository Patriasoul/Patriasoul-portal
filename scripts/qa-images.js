const fs = require("fs");
const path = require("path");

const root = process.cwd();
const files = fs.readdirSync(root).filter(f => f.startsWith("clanak-") && f.endsWith(".html"));
const registryPath = path.join(root, "assets", "js", "content-data.js");
const registry = fs.readFileSync(registryPath, "utf8");

const imageRe = /<img\b[^>]*?\bsrc\s*=\s*["']([^"']+)["']/i;
const registryImageRe = /image\s*:\s*["']([^"']+)["']/g;

const heroes = [];
const allImages = [];
for (const file of files) {
  const html = fs.readFileSync(path.join(root, file), "utf8");
  for (const match of html.matchAll(/<img\b[^>]*?\bsrc\\s*=\\s*["']([^"']+)["']/gi)) {
    allImages.push({ file, src: match[1] });
  }
  const match = html.match(imageRe);
  if (match) heroes.push({ file, src: match[1] });
}

const registryImages = [...registry.matchAll(registryImageRe)].map(m => m[1]);
const registryCounts = new Map();
for (const src of registryImages) registryCounts.set(src, (registryCounts.get(src) || 0) + 1);

const heroCounts = new Map();
for (const item of heroes) heroCounts.set(item.src, (heroCounts.get(item.src) || 0) + 1);

const duplicateRegistry = [...registryCounts.entries()]
  .filter(([, count]) => count > 1)
  .map(([src, count]) => ({ src, count }));

const duplicateHeroes = [...heroCounts.entries()]
  .filter(([, count]) => count > 1)
  .map(([src, count]) => ({
    src,
    count,
    files: heroes.filter(x => x.src === src).map(x => x.file)
  }));

const missingHero = files.filter(file => !heroes.some(x => x.file === file));

console.log("PatriaSoul Image QA");
console.log("Article pages:", files.length);
console.log("Article hero images:", heroes.length);
console.log("Registry image fields:", registryImages.length);
console.log("Duplicate registry images:", duplicateRegistry.length);
console.log("Duplicate article hero images:", duplicateHeroes.length);
console.log("All HTML image references:", allImages.length);

const uniqueRemote = [...new Set([
  ...allImages.map(x => x.src),
  ...registryImages
].filter(src => /^https?:\/\//i.test(src)))];

async function checkRemoteImages() {
  const broken = [];
  for (const src of uniqueRemote) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 12000);
      const response = await fetch(src, { method: "GET", redirect: "follow", signal: controller.signal });
      clearTimeout(timer);
      if (!response.ok) broken.push({ src, status: response.status });
      else await response.body?.cancel();
    } catch (error) {
      broken.push({ src, status: error.name === "AbortError" ? "TIMEOUT" : error.message });
    }
  }
  return broken;
}

console.log("Remote image URLs to check:", uniqueRemote.length);

console.log("Articles without a hero image:", missingHero.length);

if (duplicateRegistry.length) {
  console.log("\nDuplicate registry images:");
  for (const item of duplicateRegistry) console.log(" -", item.count + "x", item.src);
}
if (duplicateHeroes.length) {
  console.log("\nDuplicate article hero images:");
  for (const item of duplicateHeroes) {
    console.log(" -", item.count + "x", item.src);
    for (const file of item.files) console.log("    ", file);
  }
}
if (missingHero.length) {
  console.log("\nArticles without hero image:");
  for (const file of missingHero) console.log(" -", file);
}

checkRemoteImages().then(brokenRemote => {
  console.log("Broken/unreachable remote images:", brokenRemote.length);
  for (const item of brokenRemote) console.log(" -", item.status, item.src);
  if (duplicateRegistry.length || duplicateHeroes.length || brokenRemote.length) process.exit(1);
});
