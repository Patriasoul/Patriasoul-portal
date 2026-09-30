(function(){
  "use strict";
  var data=window.PatriaSoulContent&&window.PatriaSoulContent.articles||{};
  var articles=Object.keys(data).map(function(k){return data[k];}).filter(function(a){return a&&a.url&&a.title;})
    .sort(function(a,b){return (b.date||"").localeCompare(a.date||"");});
  if(!articles.length)return;

  function card(a){
    return '<article class="news-row"><a class="thumb" href="'+a.url+'"><img src="'+a.image+'" alt="'+(a.imageAlt||a.title)+'" loading="lazy" width="800" height="530"></a><div><span class="section-label">'+(a.category||"PRIČA")+'</span><h3><a href="'+a.url+'">'+a.title+'</a></h3><p>'+a.deck+'</p><small>'+a.meta+'</small></div></article>';
  }

  var lead=articles[0];
  var title=document.getElementById("home-lead-title"),deck=document.getElementById("home-lead-deck"),meta=document.getElementById("home-lead-meta"),label=document.getElementById("home-lead-label"),link=document.getElementById("home-lead-link"),image=document.getElementById("home-lead-image");
  if(title)title.textContent=lead.title;if(deck)deck.textContent=lead.deck;if(meta)meta.textContent=lead.meta;
  if(label)label.textContent=(lead.rubric||lead.kicker||"PRIČA")+" · "+(lead.category||"");
  if(link)link.href=lead.url;
  if(image){image.style.backgroundImage="url('"+lead.image+"')";image.style.backgroundSize="cover";image.style.backgroundPosition="center";var mark=image.querySelector("span");if(mark)mark.textContent=(lead.place||"Hrvatska")+" · "+(lead.period||"");}

  var top=document.getElementById("home-top-stories");
  if(top)top.innerHTML=articles.slice(1,4).map(function(a){
    return '<article class="side-story"><span class="section-label">'+(a.category||"PRIČA")+'</span><h3><a href="'+a.url+'">'+a.title+'</a></h3><p>'+a.deck+'</p></article>';
  }).join("");

  var sections=[
    {label:"VJERA",icon:"✝️",url:"vjera.html",story:"clanak-vjera-obitelj.html",fallback:"clanak-vjera-obitelj.html"},
    {label:"OBITELJ",icon:"❤️",url:"obitelj.html",story:"clanak-vjera-obitelj.html",fallback:"clanak-vjera-obitelj.html"},
    {label:"POVIJEST",icon:"📚",url:"povijest.html",story:"clanak-krbavska-bitka.html",fallback:"clanak-ruder-boskovic.html"},
    {label:"BRANITELJI",icon:"🪖",url:"branitelji-hrvatska.html",story:"clanak-blago-zadro.html",fallback:"clanak-marko-babic.html"},
    {label:"DOMOVINA",icon:"🇭🇷",url:"domovina.html",story:"clanak-trpinjska-cesta.html",fallback:"clanak-blago-zadro.html"},
    {label:"ČUVARI NASLJEĐA",icon:"🛡️",url:"cuvari-nasljeda.html",story:"clanak-mihael-stosic.html",fallback:"clanak-vlatko-gribl.html"},
    {label:"DIJASPORA",icon:"🌍",url:"dijaspora.html",story:"clanak-australski-hrvati.html",fallback:"clanak-australski-hrvati.html"},
    {label:"HRVATSKA STVARA",icon:"🔧",url:"hrvatska-stvara.html",story:"clanak-nikola-tesla-smiljan.html",fallback:"clanak-penkala.html"}
  ];
  var eg=document.getElementById("home-editorial-grid");
  if(eg)eg.innerHTML=sections.map(function(s){
    var a=articles.find(function(x){return x.url===s.story;})||articles.find(function(x){return x.url===s.fallback;});
    if(!a)return "";
    return '<article class="editorial-story-card"><a class="editorial-story-image" href="'+a.url+'"><img src="'+a.image+'" alt="'+(a.imageAlt||a.title)+'" loading="lazy" width="800" height="530"></a><div class="editorial-story-copy"><div class="editorial-story-top"><span class="editorial-icon">'+s.icon+'</span><span class="section-label">'+s.label+'</span><a href="'+s.url+'">Istraži →</a></div><h3><a href="'+a.url+'">'+a.title+'</a></h3><p>'+a.deck+'</p><a class="read-more" href="'+a.url+'">Pročitaj priču →</a></div></article>';
  }).join("");

  var news=document.getElementById("home-news-list");
  if(news)news.innerHTML=articles.slice(0,2).map(card).join("");

  var dom=document.getElementById("home-domovina-grid");
  if(dom){
    var domArticles=[articles.find(function(a){return a.url==="clanak-blago-zadro.html";}),articles.find(function(a){return a.url==="clanak-mihael-stosic.html";}),articles.find(function(a){return a.url==="clanak-vlatko-gribl.html";})].filter(Boolean);
    dom.innerHTML=domArticles.map(function(a){return '<article class="feature-card"><a class="card-image" href="'+a.url+'"><img src="'+a.image+'" alt="'+(a.imageAlt||a.title)+'" loading="lazy" width="800" height="530"></a><span class="section-label">'+(a.rubric||a.category)+'</span><h3><a href="'+a.url+'">'+a.title+'</a></h3><p>'+a.deck+'</p></article>';}).join("");
  }

  var hist=document.getElementById("home-history");
  if(hist){
    var h=articles.find(function(a){return a.url==="clanak-krbavska-bitka.html";})||articles.find(function(a){return a.category==="Povijest";});
    var minis=["clanak-penkala.html","clanak-ruder-boskovic.html"].map(function(u){return articles.find(function(a){return a.url===u;});}).filter(Boolean);
    hist.innerHTML=(h?'<article class="large-card"><a class="card-image" href="'+h.url+'"><img src="'+h.image+'" alt="'+(h.imageAlt||h.title)+'" loading="lazy" width="800" height="530"></a><span class="section-label">'+(h.rubric||h.category)+'</span><h3><a href="'+h.url+'">'+h.title+'</a></h3><p>'+h.deck+'</p></article>':"")+'<div class="mini-list">'+minis.map(function(a){return '<article><span class="section-label">'+(a.rubric||a.category)+'</span><h3><a href="'+a.url+'">'+a.title+'</a></h3></article>';}).join("")+'<article><span class="section-label">UREDNICKI STANDARD</span><h3><a href="urednicki-standard.html">Kako PatriaSoul provjerava izvore i razlikuje činjenicu od svjedočanstva</a></h3></article></div>';
  }

  var rg=document.getElementById("home-related-grid");
  if(rg){
    var base=articles.find(function(a){return a.url==="clanak-trpinjska-cesta.html";});
    var related=base?articles.filter(function(a){return a.url!==base.url&&(a.tags||[]).some(function(t){return (base.tags||[]).indexOf(t)>=0;});}).slice(0,2):articles.slice(1,3);
    rg.innerHTML=related.map(function(a){return '<article class="home-related-card"><a href="'+a.url+'"><img src="'+a.image+'" alt="'+(a.imageAlt||a.title)+'" loading="lazy" width="800" height="530"></a><div class="home-related-copy"><span class="section-label">'+(a.rubric||a.category||"PRIČA")+'</span><h3><a href="'+a.url+'">'+a.title+'</a></h3><p>'+a.deck+'</p><a class="read-more" href="'+a.url+'">Pročitaj →</a></div></article>';}).join("");
  }
})();
