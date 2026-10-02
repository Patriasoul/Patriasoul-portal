#!/usr/bin/env node
/**
 * PatriaSoul — provjera unutarnjih poveznica
 * Ne blokira legitimne vanjske izvore, ali prijavljuje vanjske poveznice
 * koje izgledaju kao navigacija prema priči/članku.
 */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const IGNORE_DIRS = new Set([".git", "node_modules", ".github"]);
const htmlFiles = [];

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) {
      htmlFiles.push(full);
    }
  }
}
walk(ROOT);

const known = new Set(htmlFiles.map(file => path.relative(ROOT, file).replaceAll(path.sep, "/")));
const broken = [];
const externalStoryLinks = [];
const externalLinks = [];

const hrefRe = /href\\s*=\\s*["']([^"']+)["']/gi;

for (const file of htmlFiles) {
  const rel = path.relative(ROOT, file).replaceAll(path.sep, "/");
  const html = fs.readFileSync(file, "utf8");
  let match;

  while ((match = hrefRe.exec(html))) {
    let href = match[1].trim();
    if (!href || href.startsWith("#") || /^(mailto:|tel:|javascript:|data:)/i.test(href)) continue;

    if (/^https?:\\/\\//i.test(href)) {
      externalLinks.push({ file: rel, href });
      const context = html.slice(Math.max(0, match.index - 220), match.index + 320);
      if (/(clanak|priča|prica|pročitaj|procitaj|saznaj više|saznaj vise|čitaj|citaj|story|article)/i.test(context)) {
        externalStoryLinks.push({ file: rel, href });
      }
      continue;
    }

    const target = href.split("#")[0].split("?")[0].replace(/^\.\//, "");
    if (!target || !target.endsWith(".html")) continue;

    const resolved = path.posix.normalize(path.posix.join(path.posix.dirname(rel), target));
    if (!known.has(resolved)) broken.push({ file: rel, href, resolved });
  }
}

console.log("\\nPatriaSoul — QA unutarnjih poveznica");
console.log("HTML stranica:", htmlFiles.length);
console.log("Vanjske poveznice:", externalLinks.length);
console.log("Pokvarene unutarnje poveznice:", broken.length);
console.log("Sumnjive vanjske poveznice na priče/članke:", externalStoryLinks.length);

if (broken.length) {
  console.log("\\nBROKEN LINKS");
  for (const item of broken) console.log(`- ${item.file} -> ${item.href} (traženo: ${item.resolved})`);
}
if (externalStoryLinks.length) {
  console.log("\\nEXTERNAL STORY LINKS");
  for (const item of externalStoryLinks) console.log(`- ${item.file} -> ${item.href}`);
}

if (broken.length || externalStoryLinks.length) process.exitCode = 1;
