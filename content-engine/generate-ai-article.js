#!/usr/bin/env node
const fs = require("fs");

const API_KEY = process.env.OPENROUTER_API_KEY;
const TOPIC = String(process.env.TOPIC || "").trim();
const MODEL = process.env.OPENROUTER_MODEL || "openrouter/free";
const OUTPUT = process.env.OUTPUT || "content-engine/ai-article.json";

if (!API_KEY) throw new Error("Nedostaje OPENROUTER_API_KEY.");
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
  ],
  "sourceCandidates": [
    {"title":"...","url":"https://..."}
  ]
}

U JSON-u navedi 3–6 kandidata za izvore samo ako možeš dati vjerodostojan naslov i URL. Generator ih označava kao KANDIDAT ZA UREDNIČKU PROVJERU. Ne predstavljaj ih kao već provjerene izvore.`;

async function callOpenRouter(extra = "") {
  const body = {
    model: MODEL,
    messages: [
      { role: "system", content: "Ti si urednički AI sustav PatriaSoul. Odgovaraj na hrvatskom i poštuj sva navedena urednička pravila." },
      { role: "user", content: prompt + "\n\nDodatna urednička uputa:\n" + extra }
    ],
    response_format: { type: "json_object" },
    max_tokens: 7000,
    temperature: 0.4
  };

  const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + API_KEY,
      "HTTP-Referer": "https://patriasoul.github.io/Patriasoul-portal/",
      "X-Title": "PatriaSoul Content Engine"
    },
    body: JSON.stringify(body)
  });

  const text = await res.text();
  if (!res.ok) throw new Error("OpenRouter API " + res.status + ": " + text.slice(0, 2000));

  const data = JSON.parse(text);
  let raw = data?.choices?.[0]?.message?.content || "";
  if (Array.isArray(raw)) raw = raw.map(x => typeof x === "string" ? x : (x?.text || "")).join("");
  if (typeof raw !== "string") raw = JSON.stringify(raw);
  if (!raw) throw new Error("OpenRouter nije vratio tekst.");

  let article;
  try { article = JSON.parse(raw); } catch {
    const cleaned = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const start = cleaned.indexOf("{"), end = cleaned.lastIndexOf("}");
    if (start < 0 || end <= start) throw new Error("OpenRouter je vratio neispravan JSON. Početak odgovora: " + cleaned.slice(0, 500));
    try {
      article = JSON.parse(cleaned.slice(start, end + 1));
    } catch (e) {
      throw new Error("OpenRouter je vratio neispravan/nepotpun JSON. Kraj odgovora: " + cleaned.slice(-1000));
    }
  }

  const sources = Array.isArray(article.sourceCandidates)
    ? article.sourceCandidates
        .filter(x => x && x.url && /^https?:\/\//i.test(x.url))
        .map(x => ({ title: x.title || x.url, url: x.url }))
        .filter((x,i,a) => a.findIndex(y => y.url === x.url) === i)
    : [];

  return { article, sources };
}

function countWords(article) {
  const text = Array.isArray(article.body)
    ? article.body.map(x => x.text || "").join(" ")
    : String(article.body || "");
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function validate(article, sources) {
  for (const k of ["title","kicker","deck","date","category","type","body"]) {
    if (!article[k]) throw new Error("AI odgovor nema obavezno polje: " + k);
  }
  if (article.author !== "PatriaSoul") throw new Error("Autor nije PatriaSoul.");
  if (article.status !== "ZA PROVJERU") throw new Error("Status nije ZA PROVJERU.");
  if (/čuvari nasljeđa/i.test(article.author)) throw new Error("Neispravan autor.");
  const words = countWords(article);
  if (words < 1500) throw new Error("Članak ima samo " + words + " riječi; potrebno je najmanje 1500.");
  if (sources.length < 1) throw new Error("AI nije dao nijedan kandidat-izvor s valjanim URL-om.");
  return words;
}

(async () => {
  let result = await callOpenRouter();
  let words = countWords(result.article);

  if (words < 1500) {
    result = await callOpenRouter(
      "Prethodni nacrt je bio prekratak. Proširi ga na najmanje 1.800 riječi, dodajući samo provjerljive činjenice, kontekst i objašnjenja. Ne ponavljaj iste misli."
    );
    words = countWords(result.article);
  }

  validate(result.article, result.sources);

  result.article.author = "PatriaSoul";
  result.article.status = "ZA PROVJERU";
  result.article.format = "Čuvari nasljeđa";
  result.article.sources = result.sources.map(
    s => "KANDIDAT ZA UREDNIČKU PROVJERU: " + s.title + " — " + s.url
  );
  result.article.wordCount = words;
  result.article.aiProvider = "OpenRouter";
  result.article.aiModel = MODEL;

  fs.writeFileSync(OUTPUT, JSON.stringify(result.article, null, 2), "utf8");
  console.log("AI članak pripremljen:", result.article.title);
  console.log("Provider: OpenRouter");
  console.log("Model:", MODEL);
  console.log("Riječi:", words, "Izvora:", result.sources.length);
})();
