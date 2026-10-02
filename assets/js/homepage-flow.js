/* PatriaSoul · Naslovnica — zajednički tok sadržaja */
(function(){
  "use strict";
  var host=document.getElementById("ps-home-flow");
  if(!host) return;
  var data=window.PatriaSoulContent&&window.PatriaSoulContent.articles||{};
  var articles=Object.keys(data).map(function(k){return data[k];}).filter(function(a){return a&&a.url&&a.title;}).sort(function(a,b){return String(b.date||"").localeCompare(String(a.date||""));});
  if(!articles.length) return;
  var groups=[
    ["Vjera","vjera.html","Vjera · ljudi · svetišta · baština"],
    ["Obitelj","obitelj.html","Obitelj · odnosi · običaji · vrijednosti"],
    ["Domovina","domovina.html","Domovina · ljudi · mjesta · sjećanje"],
    ["Povijest","povijest.html","Događaji · izvori · ljudi · povijesna memorija"],
    ["Dijaspora","dijaspora.html","Hrvatske zajednice · jezik · kultura"],
    ["Hrvatska stvara","hrvatska-stvara.html","Znanost · izumi · kultura · stvaralaštvo"],
    ["Čuvari nasljeđa","cuvari-nasljeda.html","Svjedočanstva · baština · ljudi koji čuvaju tragove"]
  ];
  function esc(v){return String(v==null?"":v).replace(/[&<>\"]/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];});}
  function matches(a,name){var h=[a.category,a.subcategory,a.rubric,(a.tags||[]).join(" ")].join(" ").toLowerCase();return h.indexOf(name.toLowerCase())!==-1;}
  function card(a){return '<article class="ps-home-card">'+(a.image?'<a class="ps-home-card-image" href="'+esc(a.url)+'"><img src="'+esc(a.image)+'" alt="'+esc(a.imageAlt||a.title)+'" loading="lazy"></a>':'')+'<div class="ps-home-card-copy"><span class="ps-card-label">'+esc(a.rubric||a.category||"PRIČA")+'</span><h3><a href="'+esc(a.url)+'">'+esc(a.title)+'</a></h3><p>'+esc(a.deck||"")+'</p><a class="ps-card-link ps-button" href="'+esc(a.url)+'">Pročitaj priču <span>→</span></a></div></article>';}
  var html='<section class="ps-home-flow" aria-label="Tematske priče PatriaSoula"><div class="ps-home-flow-intro"><span class="kicker">PATRIASOUL · TEMATSKE CJELINE</span><h2>Naslovnica koja se povezuje s cijelim portalom.</h2><p>Ovdje se automatski prikazuju najnovije priče iz glavnih rubrika. Isti sadržaj ostaje povezan s pripadajućim stranicama, bez ručnog prepisivanja.</p></div>';
  groups.forEach(function(g){var items=articles.filter(function(a){return matches(a,g[0]);}).slice(0,4);if(!items.length)return;html+='<section class="ps-home-group"><div class="ps-home-group-head"><div><span class="kicker">'+esc(g[0])+'</span><h3>'+esc(g[2])+'</h3></div><a class="ps-button ps-button-outline" href="'+g[1]+'">Otvori rubriku <span>→</span></a></div><div class="ps-home-grid">'+items.map(card).join("")+'</div></section>';});
  html+='<section class="ps-home-end"><a class="ps-home-end-card ps-home-end-primary" href="o-nama.html"><span>O PATRIASOULU</span><strong>Čuvamo priče. Provjeravamo činjenice.</strong><em>Saznaj kako radimo →</em></a><a class="ps-home-end-card" href="kontakt.html"><span>KONTAKT</span><strong>Imaš priču, izvor ili ispravak?</strong><em>Javi nam se →</em></a></section></section>';
  host.innerHTML=html;
})();
