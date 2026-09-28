#!/usr/bin/env node
const fs = require("fs");

const API_KEY = process.env.GEMINI_API_KEY;
const TOPIC = String(process.env.TOPIC || "").trim();
const MODEL = process.env.GEMINI_MODEL || "gemini-3.8-flash";
const OUTPUT = process.env.OUTPUT || "content-engine/ai-article.json";
if (!API_KEY) throw new Error("Nedostaje GEMINI_API_KEY.");
if (!TOPIC) throw new Error("Nedostaje tema članka.");

const prompt = "Ti si urednički AI sustav portala PatriaSoul.\n\nTEMATIKA:\n" + TOPIC + `

Napiši ozbiljan, sveobuhvatan hrvatski članak za PatriaSoul. Članak mora imati NAJMANJE 1.800 riječi, ciljaj 2.000–2.500 riječi. Ne popunjavaj tekst praznim frazama samo radi duljine.

OBAVEZNA UREDNIČKA PRAVILA:
- Autor je uvijek i isključivo "PatriaSoul".
- "Čuvari nasljeđa" je format/kategorija, nikada autor.
- Ne izmišljaj činjenice, osobe, datume, citate, događaje, izvore ni poveznice.
- Jasno razlikuj dokumentiranu činjenicu, svjedočanstvo, tradiciju i uredničko tumačenje.
- Prednost daj službenim institucijama, arhivima, muzejima, enciklopedijama, znanstvenoj literaturi i drugim provjerljivim izvorima.
- Ne kopiraj tuđe članke. Piši originalnim riječima.
- Nemoj izmišljati fotografiju. U ovom prvom stupnju nemoj dodavati image URL.
- Struktura: snažan uvod, 5–8 smislenih tematskih cjelina, kontekst, ključni događaji/osobe gdje je primjenjivo, značenje teme i zaključak.
- Članak mora biti informativan i čitljiv, bez političkog agitiranja ili propagande.
- Status mora biti "ZA PROVJERU".
- Datum neka bude današnji datum u hrvatskom formatu.
- Kategorija neka bude jedna od: Povijest, Domovina, Vjera, Obitelj, Baština, Čuvari nasljeđa.
- Type neka bude konkretan opis vrste članka.

VRATI ISKLJUČIVO VALJANI JSON, bez markdown oznaka, u ovom obliku:
{
  "title": "...",
  "kicker": "...",
  "deck": "...",
  "date": "...",
  "place": "...",
  "readingTime": 10,
  "category": "...",
  "type": "...",
  "status": "ZA PROVJERU",
  "author": "PatriaSoul",
  "body": [
    {"type":"h2","text":"..."},
    {"type":"p","text":"..."},
    {"type":"note","label":"DOKUMENTIRANO","text":"..."}
  ]
}

Ne navodi izvor koji nisi stvarno pronašao. `

async function callGemini(extra = "") {
  const body = {
    contents: [{ parts: [{ text: prompt + "\n\nDodatna urednička uputa:\n" + extra }] }],
    tools: [{ google_search: {} }],
    generationConfig: { responseMimeType: "application/json" }
  };
  const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + encodeURIComponent(MODEL) + ":generateContent", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": API_KEY },
    body: JSON.stringify(body)
  });
  const text = await res.text();
  if (!res.ok) throw new Error("Gemini API " + res.status + ": " + text.slice(0, 2000));
  const data = JSON.parse(text);
  const raw = data?.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
  if (!raw) throw new Error("Gemini nije vratio tekst.");
  let article;
  try { article = JSON.parse(raw); } catch {
    const start = raw.indexOf("{"), end = raw.lastIndexOf("}");
    if (start < 0 || end <= start) throw new Error("Odgovor nije valjani JSON.");
    article = JSON.parse(raw.slice(start, end + 1));
  }
  const grounding = data?.candidates?.[0]?.groundingMetadata || {};
  const chunks = Array.isArray(grounding.groundingChunks) ? grounding.groundingChunks : [];
  const sources = chunks.map(c => c.web).filter(x => x && x.uri).map(x => ({ title: x.title || x.uri, url: x.uri })).filter((x,i,a) => a.findIndex(y => y.url === x.url) === i);
  return { article, sources, groundingQueries: grounding.webSearchQueries || [] };
}
function countWords(article) {
  const text = Array.isArray(article.body) ? article.body.map(x => x.text || "").join(" ") : String(article.body || "");
  return text.trim().split(/\s+/).filter(Boolean).length;
}
function validate(article, sources) {
  for (const k of ["title","kicker","deck","date","category","type","body"]) if (!article[k]) throw new Error("AI odgovor nema obavezno polje: " + k);
  if (article.author !== "PatriaSoul") throw new Error("Autor nije PatriaSoul.");
  if (article.status !== "ZA PROVJERU") throw new Error("Status nije ZA PROVJERU.");
  if (/čuvari nasljeđa/i.test(article.author)) throw new Error("Neispravan autor.");
  const words = countWords(article);
  if (words < 1500) throw new Error("Članak ima samo " + words + " riječi; potrebno je najmanje 1500.");
  if (sources.length < 1) throw new Error("Nije pronađen nijedan provjerljivi web izvor.");
  return words;
}
(async () => {
  let result = await callGemini();
  let words = countWords(result.article);
  if (words < 1500) {
    result = await callGemini("Prethodni nacrt je bio prekratak. Proširi ga na najmanje 1.800 riječi, dodajući samo provjerljive činjenice, kontekst i objašnjenja. Ne ponavljaj iste misli.");
    words = countWords(result.article);
  }
  validate(result.article, result.sources);
  result.article.author = "PatriaSoul";
  result.article.status = "ZA PROVJERU";
  result.article.format = "Čuvari nasljeđa";
  result.article.sources = result.sources.map(s => s.title + " — " + s.url);
  result.article.wordCount = words;
  result.article.groundingQueries = result.groundingQueries;
  fs.writeFileSync(OUTPUT, JSON.stringify(result.article, null, 2), "utf8");
  console.log("AI članak pripremljen:", result.article.title);
  console.log("Riječi:", words, "Izvora:", result.sources.length);
})();