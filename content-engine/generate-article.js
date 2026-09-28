#!/usr/bin/env node
const fs=require("fs"),path=require("path");
const inputPath=process.argv[2]||"content-engine/content-queue.json";
const outputDir=process.argv[3]||"content-engine/generated";
const AUTHOR="PatriaSoul", ALLOWED=new Set(["TEST","ZA PROVJERU"]);
function esc(v=""){return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");}
function slugify(v){return String(v).normalize("NFD").replace(/[\\u0300-\\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-+|-+$/g,"");}
function req(o,k){if(!o[k]||!String(o[k]).trim())throw Error("Nedostaje: "+k);}
function wordCount(a){const raw=Array.isArray(a.body)?a.body.map(x=>x.text||x.html||"").join(" "):String(a.body||"");return raw.replace(/<[^>]*>/g," ").trim().split(/\\s+/).filter(Boolean).length;}\nfunction validate(a){["title","kicker","deck","date","category","type","body","sources"].forEach(k=>req(a,k));if(a.author&&a.author!==AUTHOR)throw Error("Autor mora biti PatriaSoul.");a.author=AUTHOR;if(!ALLOWED.has(a.status))throw Error("Status mora biti TEST ili ZA PROVJERU.");if(!Array.isArray(a.sources)||!a.sources.length)throw Error("Nedostaje izvor.");if(a.status==="ZA PROVJERU"&&wordCount(a)<1500)throw Error("Članak za uredničku provjeru mora imati najmanje 1500 riječi. Trenutno: "+wordCount(a)+".");if(/čuvari nasljeđa/i.test(a.author))throw Error("Neispravan autor.");}
function render(a){
 const meta="Piše: "+AUTHOR+" · "+a.date+(a.place?" · "+a.place:"")+(a.readingTime?" · "+a.readingTime+" min čitanja":"");
 const body=Array.isArray(a.body)?a.body.map(x=>x.type==="h2"?"<h2>"+esc(x.text)+"</h2>":x.type==="note"?'<div class="editorial-note"><strong>'+esc(x.label||"DOKUMENTIRANO")+'</strong><p>'+esc(x.text)+"</p></div>":"<p>"+(x.html||esc(x.text||""))+"</p>").join("\n"):String(a.body);
 const sources=a.sources.map(s=>"<p>• "+esc(s)+"</p>").join("\n");
 const image=a.image?'<figure class="article-figure"><img class="article-hero" src="'+esc(a.image.url)+'" alt="'+esc(a.image.alt||a.title)+'"><figcaption>'+esc(a.image.caption||"Izvor fotografije naveden uz članak.")+"</figcaption></figure>":"";
 return "<!doctype html><html lang=\"hr\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>"+esc(a.title)+" · PatriaSoul</title><link rel=\"stylesheet\" href=\"../../assets/css/portal.css\"></head><body><div style=\"background:#8b0000;color:#fff;padding:12px;text-align:center;font-weight:800\">AUTOMATSKI PRIPREMLJENO · "+esc(a.status)+" · NIJE JAVNA OBJAVA</div><header class=\"site-header\"><div class=\"topbar\"><a class=\"brand\" href=\"../../index.html\"><span class=\"brand-mark\">🇭🇷</span><span><strong>PatriaSoul</strong><small>Čuvari nasljeđa</small></span></a></div></header><main class=\"article-page container\"><div class=\"article-kicker\">"+esc(a.kicker)+"</div><h1>"+esc(a.title)+"</h1><p class=\"article-deck\">"+esc(a.deck)+"</p><div class=\"article-meta\">"+esc(meta)+"</div><div class=\"editorial-note\"><strong>UREDNIČKI STATUS: "+esc(a.status)+"</strong><p>Autor: <strong>PatriaSoul</strong>. „Čuvari nasljeđa” može biti format ili kategorija, ali nije autor.</p></div>"+image+"<div class=\"article-body\">"+body+"<h2>Izvori i literatura</h2><div class=\"article-sources\">"+sources+"</div></div></main><footer class=\"site-footer\"><div class=\"container\"><strong>PatriaSoul · Čuvari nasljeđa</strong><p>Članak čeka uredničku provjeru.</p></div></footer><script src=\"../../assets/js/portal.js\"></script></body></html>";
}
const data=JSON.parse(fs.readFileSync(inputPath,"utf8")), articles=Array.isArray(data)?data:(data.articles||[]);
if(!articles.length)throw Error("Nema članaka za obradu.");
fs.mkdirSync(outputDir,{recursive:true});
const manifest=[];
for(const a of articles){validate(a);const slug=a.slug||slugify(a.title),file=path.join(outputDir,slug+".html");fs.writeFileSync(file,render(a),"utf8");manifest.push({slug,title:a.title,author:AUTHOR,status:a.status,file});}
fs.writeFileSync(path.join(outputDir,"manifest.json"),JSON.stringify({generatedAt:new Date().toISOString(),articles:manifest},null,2));
console.log("Generirano:",manifest.length,"članaka");