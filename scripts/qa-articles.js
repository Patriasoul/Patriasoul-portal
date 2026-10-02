#!/usr/bin/env node
const fs=require("fs");
const path=require("path");
const root=process.cwd();
const files=fs.readdirSync(root).filter(f=>/^clanak-.*\.html$/.test(f));
const problems=[];
for(const file of files){
  const html=fs.readFileSync(path.join(root,file),"utf8");
  const checks=[
    [/assets\/css\/modern-articles\.css(?:\?v=[^"' ]+)?/.test(html),"modern-articles.css"],
    [/class=["'][^"']*article-page/.test(html),"article-page"],
    [/class=["'][^"']*article-body/.test(html),"article-body"],
    [!/DESC/.test(html),"no DESC placeholder"],
    [!/<p[^>]*class=["'][^"']*article-deck[^"']*["'][^>]*>\s*<\/?p>/.test(html),"non-empty deck"],
  ];
  for(const [ok,label] of checks) if(!ok) problems.push(file+": "+label);
}
console.log("PatriaSoul Article QA");
console.log("clanak-*.html: "+files.length);
console.log("Problemi: "+problems.length);
if(problems.length){for(const p of problems)console.log(" - "+p);process.exit(1)}
console.log("OK — svi članci imaju jedinstveni modern article sustav.");
