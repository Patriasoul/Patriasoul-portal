const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const DATA = path.join(ROOT, "assets/js/content-data.js");
const IMAGE_DIR = path.join(ROOT, "assets/images/articles");

function escHtml(v) {
  return String(v).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function parseData(src) {
  return new Function(src.replace(/^\s*window\.PatriaSoulContent\s*=\s*/, "return "))();
}
function sourceCaption(page) {
  const title = String(page.title || "").replace(/^File:/,"");
  return "Fotografija: " + title + " · Wikimedia Commons. Autor i licenca navedeni su na izvornoj stranici.";
}
function replaceHero(html, src, alt, caption) {
  const figure = '<figure class="article-figure"><img class="article-hero" src="' + escHtml(src) + '" alt="' + escHtml(alt) + '" loading="eager" decoding="async"><figcaption>' + escHtml(caption) + '</figcaption></figure>';
  if (/<figure class="article-figure">[\s\S]*?<img[^>]+src=["'][^"']+\.svg["']/i.test(html)) {
    return html.replace(/<figure class="article-figure">[\s\S]*?<\/figure>/i, figure);
  }
  return html.replace(/(<img\b[^>]*?src=["'])[^"']+(["'])/i, "$1"+src+"$2");
}
function cleanQuery(title) {
  return String(title).replace(/[:–—·]/g," ").replace(/\b(2026|2025|2024)\b/g," ").replace(/\s+/g," ").trim();
}
async function searchCommons(title) {
  const queries = [title, cleanQuery(title)];
  for (const q of queries) {
    const api = "https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch="+encodeURIComponent(q)+"&gsrnamespace=6&gsrlimit=8&prop=imageinfo&iiprop=url|mime|extmetadata&iiurlwidth=1600&format=json&origin=*";
    const response = await fetch(api,{headers:{"User-Agent":"PatriaSoul-Image-Repair/2.1"}});
    if (!response.ok) continue;
    const json = await response.json();
    const pages = Object.values((json.query && json.query.pages) || {});
    const usable = pages.find(p => p.imageinfo && p.imageinfo[0] && /^image\/(jpeg|png|webp)$/i.test(p.imageinfo[0].mime || ""));
    if (usable) return {page:usable,info:usable.imageinfo[0]};
  }
  return null;
}
async function downloadImage(url,target) {
  const response = await fetch(url,{headers:{"User-Agent":"PatriaSoul-Image-Repair/2.0"}});
  if (!response.ok) throw new Error("HTTP "+response.status);
  fs.writeFileSync(target,Buffer.from(await response.arrayBuffer()));
}
(async()=>{
  let source=fs.readFileSync(DATA,"utf8");
  const data=parseData(source);
  const articles=data.articles||{};
  fs.mkdirSync(IMAGE_DIR,{recursive:true});
  let replaced=0,failed=0;
  for (const [key,article] of Object.entries(articles)) {
    if (!article.image || !/\.svg$/i.test(article.image)) continue;
    const found=await searchCommons(article.title);
    if (!found) { console.log("NO REAL PHOTO:",key,article.title); failed++; continue; }
    const info=found.info;
    const mime=String(info.mime||"").toLowerCase();
    const ext=mime.includes("png")?"png":mime.includes("webp")?"webp":"jpg";
    const local="assets/images/articles/"+key.replace(/[^a-z0-9_-]+/gi,"-").toLowerCase()+"."+ext;
    try { await downloadImage(info.thumburl||info.url,path.join(ROOT,local)); }
    catch(e) { console.log("DOWNLOAD FAILED:",key,e.message); failed++; continue; }
    const oldImage=article.image;
    const caption=sourceCaption(found.page);
    article.image=local; article.imageAlt=article.title; article.imageCaption=caption;
    const pagePath=path.join(ROOT,article.url);
    if (fs.existsSync(pagePath)) fs.writeFileSync(pagePath,replaceHero(fs.readFileSync(pagePath,"utf8"),local,article.title,caption),"utf8");
    source=source.split(oldImage).join(local);
    const marker="url:"+JSON.stringify(article.url);
    const pos=source.indexOf(marker);
    if(pos>=0){
      const start=Math.max(0,source.lastIndexOf("\n",Math.max(0,pos-1800)));
      const next=source.indexOf("\n",pos+500);
      const end=next<0?source.length:next;
      let block=source.slice(start,end);
      block=block.replace(/imageAlt\s*:\s*["'][^"']*["']/,"imageAlt:"+JSON.stringify(article.title));
      block=block.replace(/imageCaption\s*:\s*["'][^"']*["']/,"imageCaption:"+JSON.stringify(caption));
      source=source.slice(0,start)+block+source.slice(end);
    }
    console.log("REAL PHOTO:",key,"->",local);
    replaced++;
    await new Promise(resolve=>setTimeout(resolve,250));
  }
  fs.writeFileSync(DATA,source,"utf8");
  console.log("Real photographs installed:",replaced);
  console.log("Unresolved SVG articles:",failed);
  if(failed) process.exitCode=1;
})();