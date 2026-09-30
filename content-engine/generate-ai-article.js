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
- Ne oslanjaj se na nedostupne alate za web-pretragu; navedi samo izvore koje možeš pouzdano identificirati.
- U izvore stavi samo stvarne i relevantne URL-ove koje možeš pouzdano identificirati iz službenih/poznatih izvora.
- Jasno razlikuj dokumentiranu činjenicu, svjedočanstvo, tradiciju i uredničko tumačenje.
- Prednost imaju arhivi, muzeji, državne institucije, enciklopedije, znanstvene ustanove i druga provjerljiva literatura.
- Ne kopiraj tuđe članke. Piši originalnim riječima.
- Članak mora biti na hrvatskom jeziku.
- Status mora biti "ZA PROVJERU".
- Datum mora biti: ${today}
- Autor mora biti: PatriaSoul
- Kategorija mora biti jedna od: Povijest, Domovina, Vjera, Obitelj, Baština, Čuvari nasljeđa.
- Type neka bude konkretan opis vrste članka.
- Ciljaj 1.650–1.800 riječi. Minimum je 1.500 riječi. Budi sadržajan i ne produžuj tekst praznim frazama.
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

function decodeHtmlEntities(value) {
  return String(value)
    .replace(/&#x([0-9a-f]+);/gi, (_, hex) => {
      try { return String.fromCodePoint(parseInt(hex, 16)); } catch { return _; }
    })
    .replace(/&#([0-9]+);/g, (_, dec) => {
      try { return String.fromCodePoint(parseInt(dec, 10)); } catch { return _; }
    })
    .replace(/&quot;/gi, '"')
    .replace(/&apos;/gi, "'")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">");
}

function stripMarkdownFences(value) {
  return String(value)
    .replace(/^\s*\`\`\`(?:json)?\s*/i, "")
    .replace(/\s*\`\`\`\s*$/i, "")
    .trim();
}

function extractFirstJsonObject(value) {
  const text = String(value);
  const start = text.indexOf("{");
  if (start < 0) return "";

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = start; i < text.length; i++) {
    const ch = text[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === '"') {
        inString = false;
      }
      continue;
    }

    if (ch === '"') {
      inString = true;
    } else if (ch === "{") {
      depth++;
    } else if (ch === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }

  return "";
}

function repairJsonPlaceholders(value) {
  return String(value)
    .replace(/(^|[,\[{]\s*)\.\.\.(?=\s*[,\]}])/g, "$1")
    .replace(/,?\s*"brojRijeci"\s*:\s*\.\.\.\s*(?=,|})/gi, "")
    .replace(/,?\s*"wordCount"\s*:\s*\.\.\.\s*(?=,|})/gi, "")
    .replace(/,?\s*"[^"]+"\s*:\s*\[\.\.\.\]\s*(?=,|})/g, "")
    .replace(/,?\s*"[^"]+"\s*:\s*\.\.\.\s*(?=,|})/g, "")
    .replace(/("readingTime"\s*:\s*)(?:number|integer|string|null)\b/gi, "$11")
    .replace(/("place"\s*:\s*)null\b/gi, '$1"Hrvatska"')
    .replace(/("kicker"\s*:\s*)null\b/gi, '$1"PatriaSoul · Hrvatska"')
    .replace(/("deck"\s*:\s*)null\b/gi, '$1""')
    .replace(/("date"\s*:\s*)null\b/gi, '$1"' + today + '"')
    .replace(/("status"\s*:\s*)null\b/gi, '$1"ZA PROVJERU"')
    .replace(/("author"\s*:\s*)null\b/gi, '$1"PatriaSoul"');
}

function normalizeRawJson(value) {
  let raw = String(value || "").trim();
  raw = decodeHtmlEntities(raw);
  raw = stripMarkdownFences(raw);
  raw = extractFirstJsonObject(raw);
  raw = repairJsonPlaceholders(raw);
  return raw.trim();
}

function parseArticleJson(value) {
  const raw = normalizeRawJson(value);

  if (!raw) {
    throw new Error("OpenRouter nije vratio JSON objekt članka.");
  }

  try {
    return JSON.parse(raw);
  } catch (firstError) {
    const sanitized = raw.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");

    try {
      return JSON.parse(sanitized);
    } catch (secondError) {
      const preview = raw.slice(0, 700).replace(/\s+/g, " ");
      throw new Error(
        "OpenRouter nije vratio valjani JSON članka: " +
        firstError.message +
        " | početak odgovora: " +
        preview
      );
    }
  }
}

async function callOpenRouter(extra = "") {
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
                    "\n\nVRLO VAŽNO: vrati ISKLJUČIVO jedan potpuni JSON objekt prema zadanoj JSON shemi. " +
                    "Ne koristi markdown, trostruke backticke, komentare, elipse (...) niti placeholder vrijednosti. " +
                    "Ne skraćuj niz body niti koristi tekst poput [...]. Sve vrijednosti moraju biti stvarne i potpune."
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
          max_output_tokens: 6500
        }),
        signal: controller.signal
      });

      rawResponse = await response.text();
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("OpenRouter zahtjev je istekao nakon 180 sekundi.");
      }
      throw error;
    } finally {
      clearTimeout(timeout);
    }

    let upstreamError = "";
    try {
      const preview = JSON.parse(rawResponse);
      upstreamError = preview.error?.message || "";
    } catch (_) {}

    const retryableStatus = [408, 409, 429, 500, 502, 503, 504].includes(response.status);
    const retryableUpstream =
      /temporarily overloaded|overloaded|rate limit|capacity|timeout|temporar/i.test(upstreamError);
    const retryable = retryableStatus || retryableUpstream;

    if (!retryable || attempt === 4) {
      if (retryableUpstream && attempt === 4) {
        throw new Error("OpenRouter nije uspio nakon 4 pokušaja: " + upstreamError);
      }
      break;
    }

    const waitMs = attempt * 7000;
    console.log(
      "OpenRouter " +
      (response.status || "upstream") +
      " — " +
      (upstreamError || "privremena greška") +
      ". Ponovni pokušaj za " +
      (waitMs / 1000) + " s..."
    );
    await new Promise(resolve => setTimeout(resolve, waitMs));
  }

  if (!response.ok) {
    throw new Error(
      "OpenRouter API " + response.status + ": " +
      rawResponse.slice(0, 2000)
    );
  }

  let data;
  try {
    data = JSON.parse(rawResponse);
  } catch (error) {
    throw new Error(
      "OpenRouter nije vratio valjani JSON odgovora: " + error.message
    );
  }

  let raw = data.output_text || "";
  if (!raw && Array.isArray(data.output)) {
    raw = data.output
      .flatMap(item => Array.isArray(item.content) ? item.content : [])
      .map(item => item.text || item.output_text || "")
      .filter(Boolean)
      .join("\n");
  }

  if (!raw && data.output && typeof data.output === "string") {
    raw = data.output;
  }

  if (!raw && data.choices?.[0]?.message?.content) {
    const content = data.choices[0].message.content;
    raw = typeof content === "string"
      ? content
      : JSON.stringify(content);
  }

  if (!String(raw).trim()) {
    const detail =
      data.error?.message ||
      data.incomplete_details?.reason ||
      "prazan odgovor";
    throw new Error("OpenRouter nije vratio tekstualni izlaz: " + detail);
  }

  return parseArticleJson(raw);
}

async function callOpenRouterSafe(extra = "") {
  const jsonRepairInstruction =
    "PRETHODNI ODGOVOR NIJE BIO VALJAN JSON. Sada ga generiraj ponovno od početka. " +
    "Vrati ISKLJUČIVO jedan valjani JSON objekt prema zadanoj shemi. " +
    "Bez markdowna, bez komentara, bez teksta prije ili poslije objekta. " +
    "Nikada ne koristi ..., [...], null za obavezna polja, komentare ili placeholder tekst. " +
    "Obavezno uključi potpuno polje body kao niz objekata i potpuno polje sourceCandidates.";

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      return await callOpenRouter(extra);
    } catch (error) {
      const message = String(error.message || error);
      const malformedJson = /nije vratio valjani JSON članka|nije vratio JSON objekt članka/i.test(message);

      if (!malformedJson || attempt === 3) {
        throw error;
      }

      const waitMs = attempt * 3000;
      console.log(
        "⚠ OpenRouter je vratio neispravan JSON — ponovni pokušaj za " +
        (waitMs / 1000) + " s..."
      );
      await new Promise(resolve => setTimeout(resolve, waitMs));

      extra =
        (extra ? extra + "\n\n" : "") +
        jsonRepairInstruction;
    }
  }
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

function normalizeArticle(article) {
  if (!article || typeof article !== "object") {
    throw new Error("AI odgovor nije objekt članka.");
  }

  if (!article.kicker || !String(article.kicker).trim()) {
    article.kicker = "PatriaSoul · " + (article.category || "Hrvatska");
  }

  if (!article.deck || !String(article.deck).trim()) {
    const firstText = Array.isArray(article.body)
      ? article.body
          .map(x => String(x.text || "").trim())
          .find(Boolean)
      : "";
    article.deck = firstText
      ? firstText.replace(/\s+/g, " ").slice(0, 280).trim()
      : String(article.title || TOPIC).trim();
  }

  if (!article.place || !String(article.place).trim()) {
    article.place = "Hrvatska";
  }

  if (!Number.isInteger(article.readingTime) || article.readingTime < 1) {
    article.readingTime = Math.max(1, Math.ceil(countWords(article) / 220));
  }

  if (!article.date || !String(article.date).trim()) {
    article.date = today;
  }

  if (!article.status || !String(article.status).trim()) {
    article.status = "ZA PROVJERU";
  }

  if (!article.author || !String(article.author).trim()) {
    article.author = "PatriaSoul";
  }

  return article;
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

  if (!Array.isArray(article.body)) {
    throw new Error("AI odgovor nema valjani body niz.");
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

function hasUsableBody(article) {
  return Array.isArray(article?.body) &&
    article.body.some(item =>
      item &&
      typeof item.text === "string" &&
      item.text.trim().length > 0
    );
}

async function regenerateUntilBody(initialArticle) {
  let article = normalizeArticle(initialArticle);
  const maxAttempts = 3;

  if (hasUsableBody(article)) {
    return article;
  }

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    console.log(
      "⚠ AI odgovor nema stvarni body — tražim kompletan članak (" +
      attempt + "/" + maxAttempts + ")..."
    );

    article = normalizeArticle(await callOpenRouterSafe(
      "PRETHODNI ODGOVOR NIJE IMAO STVARAN SADRŽAJ U POLJU body. " +
      "OVAJ PUT OBAVEZNO VRATI CIJELI ČLANAK. " +
      "Polje body mora biti niz od najmanje 8 smislenih objekata, " +
      "a svaki objekt mora imati stvaran hrvatski tekst u polju text. " +
      "Članak mora imati najmanje 1.500 riječi, ciljaj 1.700 riječi. " +
      "Ne vraćaj samo naslov, metadata ili izvore. " +
      "Ne koristi prazne nizove, [...], ... ili placeholder vrijednosti. " +
      "Vrati sva obavezna polja prema JSON shemi."
    ));

    if (hasUsableBody(article) && countWords(article) >= 1500) {
      return article;
    }
  }

  const finalWords = countWords(article);
  throw new Error(
    "OpenRouter nije uspio vratiti kompletan članak s body sadržajem nakon " +
    maxAttempts + " pokušaja. Trenutni broj riječi: " + finalWords + "."
  );
}

async function generateMinimumLengthArticle(initialArticle) {
  let article = normalizeArticle(initialArticle);
  const minimumWords = 1500;
  const targetWords = 1700;
  const maxExpansionAttempts = 3;

  if (!hasUsableBody(article)) {
    return regenerateUntilBody(article);
  }

  for (let attempt = 1; attempt <= maxExpansionAttempts; attempt++) {
    const words = countWords(article);

    if (words >= minimumWords) {
      return article;
    }

    const target = Math.max(
      targetWords,
      Math.ceil(words + (minimumWords - words) * 1.6)
    );

    console.log(
      "⚠ Članak ima " + words +
      " riječi — tražim proširenje (" +
      attempt + "/" + maxExpansionAttempts +
      "), cilj " + target + " riječi..."
    );

    article = normalizeArticle(await callOpenRouterSafe(
      "PRETHODNI NACRT IMA " + words + " RIJEČI I NE ISPUNJAVA MINIMUM. " +
      "Moraš vratiti CIJELI članak ponovno, ne samo dodatne odlomke. " +
      "Ciljaj najmanje " + target + " riječi, a nikako manje od 1.500 riječi. " +
      "Zadrži naslov, temu, glavne provjerljive činjenice i postojeće izvore. " +
      "Proširi članak novim smislenim tematskim cjelinama, povijesnim kontekstom, " +
      "uzrocima i posljedicama, ključnim osobama/događajima gdje je primjenjivo i zaključkom. " +
      "Ne ponavljaj iste misli. Ne izmišljaj činjenice. " +
      "Vrati sva obavezna metadata polja i potpuno polje body prema JSON shemi."
    ));

    if (!hasUsableBody(article)) {
      article = await regenerateUntilBody(article);
    }
  }

  const finalWords = countWords(article);
  if (finalWords < minimumWords) {
    throw new Error(
      "Članak ima samo " + finalWords +
      " riječi nakon " + maxExpansionAttempts +
      " pokušaja proširenja; potrebno je najmanje " +
      minimumWords + "."
    );
  }

  return article;
}

(async () => {
  let article = normalizeArticle(await callOpenRouterSafe());

  article = await generateMinimumLengthArticle(article);

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