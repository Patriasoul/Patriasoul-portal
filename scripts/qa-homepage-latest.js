const fs = require('fs');
const path = require('path');
const vm = require('vm');
const { spawnSync } = require('child_process');

const root = process.cwd();
const failures = [];
const checks = [];

function ok(label, detail) {
  checks.push({ ok: true, label, detail });
}
function fail(label, detail) {
  failures.push({ label, detail });
}
function read(rel) {
  const file = path.join(root, rel);
  if (!fs.existsSync(file)) {
    fail('Datoteka nedostaje', rel);
    return '';
  }
  return fs.readFileSync(file, 'utf8');
}

function scriptsFrom(html) {
  return [...html.matchAll(/<script\s+src="([^"]+)"><\/script>/gi)].map(m => m[1]);
}

function checkScriptSyntax(rel) {
  const file = path.join(root, rel);
  const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
  if (result.status !== 0) fail('JavaScript sintaksa', rel + '\n' + (result.stderr || result.stdout).trim());
  else ok('JavaScript sintaksa', rel);
}

const index = read('index.html');
const latest = read('najnovije.html');
const registrySource = read('assets/js/content-data.js');

const requiredIndex = [
  'assets/js/content-data.js?v=12',
  'assets/js/homepage-render.js?v=2',
  'assets/js/homepage-flow.js?v=5',
  'assets/js/homepage-live.js?v=7',
  'assets/js/portal.js?v=12'
];
const requiredLatest = [
  'assets/js/content-data.js?v=12',
  'assets/js/article-system.js?v=2',
  'assets/js/portal.js?v=12'
];

const indexScripts = scriptsFrom(index);
const latestScripts = scriptsFrom(latest);

for (const src of requiredIndex) {
  if (!indexScripts.includes(src)) fail('Naslovnica · skripta nedostaje', src);
}
for (const src of requiredLatest) {
  if (!latestScripts.includes(src)) fail('Najnovije · skripta nedostaje', src);
}

const indexCore = indexScripts.filter(s => /(?:content-data|homepage-render|homepage-flow|homepage-live|portal)\.js/.test(s));
if (indexCore.length !== requiredIndex.length) fail('Naslovnica · duplikati/stare skripte', indexCore.join('\n'));
else ok('Naslovnica · skripte', indexCore.join(' → '));

const latestCore = latestScripts.filter(s => /(?:content-data|article-system|portal)\.js/.test(s));
if (latestCore.length !== requiredLatest.length) fail('Najnovije · duplikati/stare skripte', latestCore.join('\n'));
else ok('Najnovije · skripte', latestCore.join(' → '));

for (const id of ['breaking-ticker-track','home-lead-title','home-top-stories','ps-home-flow','home-news-list','weather-cities']) {
  if (!index.includes('id="' + id + '"')) fail('Naslovnica · DOM element nedostaje', id);
}
for (const id of ['latest-list','latest-category','latest-count','latest-weather']) {
  if (!latest.includes('id="' + id + '"')) fail('Najnovije · DOM element nedostaje', id);
}

const sandbox = { window: {}, console };
try {
  vm.runInNewContext(registrySource, sandbox, { filename: 'content-data.js' });
  const articles = sandbox.window.PatriaSoulContent && sandbox.window.PatriaSoulContent.articles;
  if (!articles || typeof articles !== 'object') {
    fail('Centralni registar', 'window.PatriaSoulContent.articles nije dostupan');
  } else {
    const rows = Object.entries(articles);
    ok('Centralni registar', rows.length + ' članaka');
    for (const [id, article] of rows) {
      if (!article || !article.title || !article.url || !article.date) fail('Registar · nepotpun članak', id);
      if (article.url && /^[^/]+\.html(?:[#?].*)?$/i.test(article.url)) {
        const target = article.url.split(/[?#]/)[0];
        if (!fs.existsSync(path.join(root, target))) fail('Registar · nepostojeći URL', id + ' → ' + target);
      }
    }
  }
} catch (error) {
  fail('Centralni registar · JavaScript izvršavanje', error.message);
}

[
  'assets/js/content-data.js',
  'assets/js/homepage-render.js',
  'assets/js/homepage-flow.js',
  'assets/js/homepage-live.js',
  'assets/js/portal.js',
  'assets/js/article-system.js'
].forEach(checkScriptSyntax);

const workflow = read('.github/workflows/fix-homepage-live.yml');
if (workflow && !workflow.includes('assets/js/portal.js?v=12')) fail('Deployment workflow', 'fix-homepage-live.yml ne vraća portal.js');
else if (workflow) ok('Deployment workflow', 'portal.js ostaje u naslovnici');

const oldPortalRewrite = /replaces?\([^\n]*portal\.js|s\.replace\([^\n]*portal\.js[^\n]*homepage-live/i.test(workflow);
if (oldPortalRewrite) fail('Deployment workflow', 'workflow ponovno može zamijeniti portal.js s homepage-live.js');

const summary = [
  'PatriaSoul · QA naslovnice i Najnovije',
  'Provjera: ' + checks.length + ' uspješnih kontrola',
  'Greške: ' + failures.length
];
for (const item of failures) summary.push('FAIL · ' + item.label + ' · ' + item.detail);
if (failures.length) {
  console.error(summary.join('\n'));
  process.exit(1);
}
console.log(summary.join('\n'));
