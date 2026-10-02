/* PatriaSoul · Naslovnica — slider sadržaj svih glavnih stranica */
(function(){
  "use strict";

  var host=document.getElementById("ps-home-flow");
  if(!host) return;

  var data=window.PatriaSoulContent&&window.PatriaSoulContent.articles||{};
  var articles=Object.keys(data).map(function(k){return data[k];})
    .filter(function(a){return a&&a.url&&a.title;})
    .sort(function(a,b){return String(b.date||"").localeCompare(String(a.date||""));});

  if(!articles.length) return;

  var groups=[
    ["Hrvatska danas","hrvatska-danas.html","Najnovije vijesti · društvo · gospodarstvo · turizam"],
    ["Vjera","vjera.html","Vjera · ljudi · svetišta · baština"],
    ["Obitelj","obitelj.html","Obitelj · odnosi · običaji · vrijednosti"],
    ["Domovina","domovina.html","Domovina · ljudi · mjesta · sjećanje"],
    ["Povijest","povijest.html","Događaji · izvori · ljudi · povijesna memorija"],
    ["Dijaspora","dijaspora.html","Hrvatske zajednice · jezik · kultura"],
    ["Hrvatska stvara","hrvatska-stvara.html","Znanost · izumi · kultura · stvaralaštvo"],
    ["Čuvari nasljeđa","cuvari-nasljeda.html","Svjedočanstva · baština · ljudi koji čuvaju tragove"]
  ];

  function esc(v){
    return String(v==null?"":v).replace(/[&<>"]/g,function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",""":"&quot;"}[c];
    });
  }

  function matches(a,name){
    var h=[a.category,a.subcategory,a.rubric,(a.tags||[]).join(" ")].join(" ").toLowerCase();
    return h.indexOf(name.toLowerCase())!==-1;
  }

  function card(a){
    return '<article class="ps-home-card">'
      +(a.image
        ? '<a class="ps-home-card-image" href="'+esc(a.url)+'"><img src="'+esc(a.image)+'" alt="'+esc(a.imageAlt||a.title)+'" loading="lazy"></a>'
        : '')
      +'<div class="ps-home-card-copy">'
      +'<span class="ps-card-label">'+esc(a.rubric||a.category||"PRIČA")+'</span>'
      +'<h3><a href="'+esc(a.url)+'">'+esc(a.title)+'</a></h3>'
      +'<p>'+esc(a.deck||"")+'</p>'
      +'<a class="ps-card-link ps-button" href="'+esc(a.url)+'">Pročitaj priču <span>→</span></a>'
      +'</div></article>';
  }

  function sliderSection(g,index){
    var items=articles.filter(function(a){return matches(a,g[0]);}).slice(0,8);
    if(!items.length) return "";

    var sliderId="ps-home-slider-"+index;

    return '<section class="ps-home-group">'
      +'<div class="ps-home-group-head">'
      +'<div><span class="kicker">'+esc(g[0])+'</span><h3>'+esc(g[2])+'</h3></div>'
      +'<div class="ps-home-group-actions">'
      +'<button class="ps-slider-btn" type="button" data-slider="'+sliderId+'" data-direction="-1" aria-label="Prethodne priče">←</button>'
      +'<button class="ps-slider-btn" type="button" data-slider="'+sliderId+'" data-direction="1" aria-label="Sljedeće priče">→</button>'
      +'<a class="ps-button ps-button-outline" href="'+g[1]+'">Otvori stranicu <span>→</span></a>'
      +'</div></div>'
      +'<div class="ps-home-slider" id="'+sliderId+'" tabindex="0" aria-label="'+esc(g[0])+' — priče">'
      +'<div class="ps-home-slider-track">'+items.map(card).join("")+'</div>'
      +'</div>'
      +'<div class="ps-slider-hint"><span>← Povuci za još priča →</span><span>'+items.length+' priča</span></div>'
      +'</section>';
  }

  var html='<section class="ps-home-flow" aria-label="Tematske priče PatriaSoula">'
    +'<div class="ps-home-flow-intro">'
    +'<span class="kicker">PATRIASOUL · NASLOVNICA</span>'
    +'<h2>Jedna naslovnica povezana sa svim glavnim stranicama.</h2>'
    +'<p>Svaka glavna rubrika ima svoj klizni blok priča. Sadržaj se automatski povlači iz zajedničke baze članaka, a klik vodi izravno na PatriaSoul priču ili pripadajuću stranicu.</p>'
    +'</div>';

  groups.forEach(function(g,i){html+=sliderSection(g,i);});

  html+='<section class="ps-home-end" aria-label="O PatriaSoulu i kontakt">'
    +'<a class="ps-home-end-card ps-home-end-primary" href="o-nama.html">'
    +'<span>O PATRIASOULU</span>'
    +'<strong>Čuvamo priče. Provjeravamo činjenice. Prenosimo nasljeđe.</strong>'
    +'<p>Upoznaj našu uredničku ideju, standarde i način rada.</p>'
    +'<em>Otvori O PatriaSoulu →</em>'
    +'</a>'
    +'<a class="ps-home-end-card ps-home-end-contact" href="kontakt.html">'
    +'<span>KONTAKT</span>'
    +'<strong>Imaš priču, izvor, fotografiju ili ispravak?</strong>'
    +'<p>Pošalji nam materijal i pomozi da priče ostanu provjerene i sačuvane.</p>'
    +'<em>Otvori Kontakt →</em>'
    +'</a>'
    +'</section></section>';

  host.innerHTML=html;

  host.querySelectorAll(".ps-slider-btn").forEach(function(btn){
    btn.addEventListener("click",function(){
      var slider=document.getElementById(btn.getAttribute("data-slider"));
      if(!slider) return;
      var direction=Number(btn.getAttribute("data-direction"))||1;
      var amount=Math.max(slider.clientWidth*.82,280)*direction;
      slider.scrollBy({left:amount,behavior:"smooth"});
    });
  });

  host.querySelectorAll(".ps-home-slider").forEach(function(slider){
    slider.addEventListener("keydown",function(e){
      if(e.key==="ArrowLeft") slider.scrollBy({left:-slider.clientWidth*.82,behavior:"smooth"});
      if(e.key==="ArrowRight") slider.scrollBy({left:slider.clientWidth*.82,behavior:"smooth"});
    });
  });
})();