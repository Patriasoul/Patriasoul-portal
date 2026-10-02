#!/usr/bin/env node
/**
 * PatriaSoul — QA unutarnjih poveznica
 *
 * Pravilo:
 * - unutarnje .html poveznice moraju postojati
 * - vanjske poveznice su dopuštene kao izvori, literatura, arhivi,
 *   institucije i fotografije
 * - kao grešku prijavljujemo samo vanjsku poveznicu koja stvarno izgleda
 *   kao CTA/navigacija prema drugoj priči, a ne legitimni izvor unutar članka
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

    if (entry.isDirectory()) {
      walk(full);
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith(".html")) {
      htmlFiles.push(full);
    }
  }
}

walk(ROOT);

const known = new Set(
  htmlFiles.map(file =>
    path.relative(ROOT, file).replaceAll(path.sep, "/")
  )
);

const broken = [];
const externalStoryLinks = [];
const externalLinks = [];

// Hvata cijeli <a ...>...</a> element kako bismo mogli razlikovati
// navigacijsku/CTA poveznicu od poveznice u "Izvori i literatura".
const anchorRe =
  /<a\b([^>]*?)\bhref\s*=\s*["']([^"']+)["']([^>]*)>([\s\S]*?)<\/a>/gi;

for (const file of htmlFiles) {
  const rel = path.relative(ROOT, file).replaceAll(path.sep, "/");
  const html = fs.readFileSync(file, "utf8");
  let match;

  while ((match = anchorRe.exec(html))) {
    const href = match[2].trim();
    const openTag = match[1] + match[3];
    const anchorText = match[4]
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();

    if (
      !href ||
      href.startsWith("#") ||
      /^(mailto:|tel:|javascript:|data:)/i.test(href)
    ) {
      continue;
    }

    if (/^https?:\/\//i.test(href)) {
      externalLinks.push({ file: rel, href });

      // Izvori i literatura su namjerno vanjske poveznice.
      const isSourceLink =
        /(?:article-?sources|sources|izvor|izvori|literatura|reference)/i.test(
          openTag
        ) ||
        /(?:enciklopedija|min-kulture|mvep|vatican|hkm|ika|hrt|reuters|tportal|wikimedia|branitelji|centardomovinskograta|crorec|hds|gloria|mint|hzinfra|mzom)/i.test(
          href
        );

      // Ovo su obrasci koji stvarno znače "idi na drugu priču".
      const looksLikeStoryCta =
        /(?:read-more|story|article|card-link|related|external-story)/i.test(
          openTag
        ) ||
        /(?:pročitaj|procitaj|saznaj više|saznaj vise|čitaj|citaj|otvori priču|otvori pricu|povezana priča|povezana prica|više o|vise o)/i.test(
          anchorText
        );

      if (!isSourceLink && looksLikeStoryCta) {
        externalStoryLinks.push({ file: rel, href });
      }

      continue;
    }

    const target = href
      .split("#")[0]
      .split("?")[0]
      .replace(/^\.\//, "");

    if (!target || !target.endsWith(".html")) continue;

    const resolved = path.posix.normalize(
      path.posix.join(path.posix.dirname(rel), target)
    );

    if (!known.has(resolved)) {
      broken.push({ file: rel, href, resolved });
    }
  }
}

console.log("\nPatriaSoul — QA unutarnjih poveznica");
console.log("HTML stranica:", htmlFiles.length);
console.log("Vanjske poveznice:", externalLinks.length);
console.log("Pokvarene unutarnje poveznice:", broken.length);
console.log(
  "Sumnjive vanjske poveznice na priče/članke:",
  externalStoryLinks.length
);

if (broken.length) {
  console.log("\nBROKEN LINKS");
  for (const item of broken) {
    console.log(
      `- ${item.file} -> ${item.href} (traženo: ${item.resolved})`
    );
  }
}

if (externalStoryLinks.length) {
  console.log("\nEXTERNAL STORY LINKS");
  for (const item of externalStoryLinks) {
    console.log(`- ${item.file} -> ${item.href}`);
  }
}

// QA pada samo zbog stvarno pokvarenih internih poveznica ili
// stvarne vanjske CTA poveznice prema priči.
if (broken.length || externalStoryLinks.length) {
  process.exitCode = 1;
}
