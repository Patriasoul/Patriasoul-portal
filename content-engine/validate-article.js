const fs = require("fs");
const path = require("path");

const file = process.argv[2];
if (!file) {
  console.error("Usage: node content-engine/validate-article.js <article.json>");
  process.exit(1);
}

const article = JSON.parse(fs.readFileSync(file, "utf8"));
const errors = [];
const warnings = [];

const required = ["slug","title","category","date","deck","content","sources","editorial"];
for (const key of required) {
  if (article[key] === undefined || article[key] === null || article[key] === "") {
    errors.push(`Nedostaje obavezno polje: ${key}`);
  }
}

if (article.date && !/^\d{4}-\d{2}-\d{2}$/.test(article.date)) {
  errors.push("Datum mora biti u formatu YYYY-MM-DD.");
}

if (!Array.isArray(article.content) || article.content.length === 0) {
  errors.push("content mora sadržavati barem jedan odlomak.");
}

if (!Array.isArray(article.sources) || article.sources.length === 0) {
  errors.push("Članak mora imati najmanje jedan izvor.");
} else {
  article.sources.forEach((source, i) => {
    if (!source.title || !source.url) errors.push(`Izvor #${i + 1} mora imati naslov i URL.`);
  });
}

const editorial = article.editorial || {};
if (!["draft","needs-review","verified"].includes(editorial.verificationStatus)) {
  errors.push("editorial.verificationStatus mora biti draft, needs-review ili verified.");
}
if (!editorial.processedAt) errors.push("Nedostaje editorial.processedAt.");
if (typeof editorial.reviewRequired !== "boolean") {
  errors.push("editorial.reviewRequired mora biti true ili false.");
}

if (article.author === "Čuvari nasljeđa") {
  if (!article.contentType) warnings.push("Čuvari nasljeđa: preporučeno je navesti contentType.");
  if (!["svjedočanstvo","sjećanje","osobna-priča","kombinirano"].includes(article.contentType)) {
    warnings.push("Čuvari nasljeđa: contentType treba jasno razlikovati osobno svjedočanstvo/sjećanje od uredničke obrade.");
  }
  if (!editorial.reviewRequired) warnings.push("Čuvari nasljeđa: preporučena je ručna urednička provjera.");
}

if (article.image && !article.imageAlt) warnings.push("Slika postoji, ali nedostaje imageAlt.");
if (article.image && !article.imageSource) warnings.push("Slika postoji, ali nedostaje imageSource; provjeriti izvor/autora/licencu.");
if (editorial.verificationStatus !== "verified") {
  warnings.push("Članak nije označen kao verified i ne treba automatsku javnu objavu.");
}

if (errors.length) {
  console.error("PATRIASOUL EDITORIAL VALIDATION: FAIL");
  errors.forEach(e => console.error("ERROR:", e));
  warnings.forEach(w => console.warn("WARNING:", w));
  process.exit(1);
}

console.log("PATRIASOUL EDITORIAL VALIDATION: PASS");
warnings.forEach(w => console.warn("WARNING:", w));
