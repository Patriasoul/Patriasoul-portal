#!/usr/bin/env node

const fs = require("fs");

const API_KEY = process.env.OPENROUTER_API_KEY;
const TOPIC = String(process.env.TOPIC || "").trim();
const MODEL = process.env.OPENROUTER_MODEL || "openrouter/free";
const OUTPUT = process.env.OUTPUT || "content-engine/ai-article.json";

if (!API_KEY) throw new Error("Nedostaje OPENROUTER_API_KEY.");
if (!TOPIC) throw new Error("Nedostaje tema članka.");

const today = new Intl.DateTimeFormat("hr-HR", {
  timeZone: "Europe/Zagreb",
  day: "numeric",
  month: "long",
  year: "numeric"
}).format(new Date());

const systemPrompt = `
Ti si urednički AI sustav portala PatriaSoul.

PatriaSoul ne nabraja Hrvatsku. PatriaSoul istražuje, provjerava i pripovijeda njezine priče.

OBAVEZNA UREDNIČKA PRAVILA:
- Autor je uvijek i isključivo "PatriaSoul".
- "Čuvari nasljeđa" je format/kategorija, nikada autor.
- Ne izmišljaj činjenice, osobe, datume, citate, događaje, izvore ni poveznice.
- Koristi web pretragu za provjeru povijesnih i činjeničnih tvrdnji kada je dostupna.
- U izvore stavi samo stvarne i relevantne URL-ove koje možeš identificirati iz rezultata pretrage ili službenih/poznatih izvora.
- Jasno razlikuj dokumentiranu činjenicu, svjedočanstvo, tradiciju i uredničko tumačenje.
- Prednost imaju arhivi, muzeji, državne institucije, enciklopedije, znanstvene ustanove i druga provjerljiva literatura.
- Ne kopiraj tuđe članke. Piši originalnim riječima.
- Članak mora biti na hrvatskom jeziku.
- Status mora biti "ZA PROVJERU".
- Datum mora biti: ${today}
- Autor mora biti: PatriaSoul
- Kategorija mora biti jedna od: Povijest, Domovina, Vjera, Obitelj, Baština, Čuvari nasljeđa.
- Type neka bude konkretan opis vrste članka.
- Napiši najmanje 1.800 riječi. Ciljaj 2.000–2.500 riječi. Ne produžuj tekst praznim frazama.
- Struktura treba imati snažan uvod, 5–8 smislenih tematskih cjelina, kontekst, ključne događaje/osobe gdje je primjenjivo, značenje teme i zaključak.
- Ne dodaj image URL u ovoj fazi.
- Članak ide samo na uredničku provjeru; nije javna objava.
`;

const schema = {
  type: "object",
  additionalProperties: false,
  properties: {
    slug: { type: "string" },
    title: { type: "string" },
    kicker: { type: "string" },
    deck: { type: "string" },
    date: { type: "string" },
    place: { type: "string" },
    readingTime: { type: "integer" },
    category: { type: "string" },
    type: { type: "string" },
    status: { type: "string" },
    author: { type: "string" },
    body: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          type: { type: "string" },
          text: { type: "string" },
          label: { type: "string" }
        },
        required: ["type", "text", "label"]
      }
    },
    sourceCandidates: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          url: { type: "string" }
        },
        required: ["title", "url"]
      }
    }
  },
  required: [
    "slug","title","kicker","deck","date","place","readingTime",
    "category","type","status","author","body","sourceCandidates"
  ]
};

async function callOpenAI(extra = "") {
  let response;
  let rawResponse = "";
  for (let attempt = 1; attempt <= 4; attempt++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 180000);
    try {
      response = await fetch("https://openrouter.ai/api/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + API_KEY,
        "HTTP-Referer": "https://patriasoul.github.io/Patriasoul-portal/",
        "X-Title": "PatriaSoul Content Engine"
      },
      body: JSON.stringify({
        model: MODEL,
        store: false,
        tools: [{ type: "web_search" }],
        instructions: systemPrompt,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text:
                  "Napiši članak na temu: " + TOPIC +
                  "\n\n" + extra +
                  "\n\nVrati samo podatke prema zadanoj JSON shemi."
              }
            ]
          }
        ],
        text: {
          format: {
            type: "json_schema",
            name: "patriasoul_article",
            strict: true,
            schema
          }
        },
        max_output_tokens: 8000
      })
    });

    rawResponse = await response.text();
    if (response.status !== 429 || attempt === 4) break;

    const waitMs = attempt * 5000;
    console.log("OpenRouter 429 — ponovni pokušaj za " + (waitMs / 1000) + " s...");
    await new Promise(resolve => setTimeout(resolve, waitMs));
  }

  const rawResponse = await response.text();

  if (!response.ok) {
    throw new Error(
      "OpenRouter API " + response.status + ": " +
      rawResponse.slice(0, 2000)
    );
  }

  const data = JSON.parse(rawResponse);

  // OpenRouter Responses može vratiti tekst u output_text ili
  // u output[].content[].text, ovisno o modelu/routeru.
  const raw = data.output_text ||
    (Array.isArray(data.output)
      ? data.output
          .flatMap(item => Array.isArray(item.content) ? item.content : [])
          .map(item => item.text || "")
          .filter(Boolean)
          .join("\n")
      : "");

  if (!raw) {
    const detail = data.error?.message || data.incomplete_details?.reason || "prazan odgovor";
    throw new Error("OpenRouter nije vratio tekstualni izlaz: " + detail);
  }

  let article;
  try {
    article = JSON.parse(raw);
  } catch (error) {
    throw new Error(
      "OpenRouter nije vratio valjani JSON: " + error.message
    );
  }

  return article;
}

function countWords(article) {
  const text = Array.isArray(article.body)
    ? article.body.map(x => x.text || "").join(" ")
    : String(article.body || "");

  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

function cleanSources(article) {
  const sources = Array.isArray(article.sourceCandidates)
    ? article.sourceCandidates
        .filter(x => {
          try {
            const u = new URL(x.url);
            return x.title && (u.protocol === "http:" || u.protocol === "https:");
          } catch {
            return false;
          }
        })
        .map(x => ({
          title: String(x.title).trim(),
          url: String(x.url).trim()
        }))
        .filter((x, i, a) =>
          a.findIndex(y => y.url === x.url) === i
        )
    : [];

  return sources;
}

function validate(article) {
  for (const key of [
    "title","kicker","deck","date","category",
    "type","body","sourceCandidates"
  ]) {
    if (
      article[key] === undefined ||
      article[key] === null ||
      (typeof article[key] === "string" && !article[key].trim())
    ) {
      throw new Error("AI odgovor nema obavezno polje: " + key);
    }
  }

  if (article.author !== "PatriaSoul") {
    throw new Error("Autor nije PatriaSoul.");
  }

  if (article.status !== "ZA PROVJERU") {
    throw new Error("Status nije ZA PROVJERU.");
  }

  const words = countWords(article);

  if (words < 1500) {
    throw new Error(
      "Članak ima samo " + words +
      " riječi; potrebno je najmanje 1500."
    );
  }

  const sources = cleanSources(article);

  if (sources.length < 1) {
    throw new Error(
      "AI nije dao nijedan kandidat-izvor s valjanim URL-om."
    );
  }

  return { words, sources };
}

(async () => {
  let article = await callOpenAI();

  if (countWords(article) < 1500) {
    article = await callOpenAI(
      "Prethodni nacrt je bio prekratak. Proširi ga na najmanje 1.500 riječi. Dodaj samo provjerljiv kontekst i činjenice. Ne ponavljaj iste misli."
    );
  }

  const { words, sources } = validate(article);

  article.slug =
    String(article.slug || article.title)
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);

  article.author = "PatriaSoul";
  article.status = "ZA PROVJERU";
  article.format = "Čuvari nasljeđa";
  article.sources = sources.map(
    s =>
      "KANDIDAT ZA UREDNIČKU PROVJERU: " +
      s.title + " — " + s.url
  );
  article.wordCount = words;
  article.aiProvider = "OpenRouter";
  article.aiModel = MODEL;

  delete article.sourceCandidates;

  fs.writeFileSync(
    OUTPUT,
    JSON.stringify(article, null, 2) + "\n",
    "utf8"
  );

  console.log("✓ članak generiran:", article.title);
  console.log("✓ izvori prisutni:", sources.length);
  console.log("✓ riječi:", words);
  console.log("✓ provider: OpenRouter");
  console.log("✓ model:", MODEL);
})();
