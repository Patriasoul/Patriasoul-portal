# PatriaSoul Content Engine — v1

Ovaj modul je namjerno odvojen od postojećeg portala. Ne mijenja postojeće HTML stranice, assets/js/content-data.js, CSS ni postojeće deploy workflowe.

## Cilj v1
1. strukturirani format za nove članke
2. validacija obaveznih polja
3. zaštita od duplih URL-ova i naslova
4. siguran temelj za kasniju automatsku izradu stranice
5. prvo test, pa tek onda spajanje s portalom

## Struktura
- content-engine/schema/article.schema.json — ugovor za nove članke
- content-engine/validate-content.js — provjera postojećeg content-data.js
- .github/workflows/patria-content-engine-validate.yml — samo provjera; ne objavljuje sadržaj

## Sigurnost
v1 ne piše u postojeće HTML datoteke i ne radi automatski deploy sadržaja.

## Plan
v1: validacija
v2: generator članka + generated-content.js
v3: povezivanje s naslovnicom, Najnovijima i pretragom
v4: ručni GitHub Actions unos novog članka
v5: opcionalni AI provider preko GitHub Secrets
