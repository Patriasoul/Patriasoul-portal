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
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];
    });
  }

  function matches(a,name){
    return String(a.category||"").trim().toLowerCase()===String(name||"").trim().toLowerCase();
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

  var bibleQuotes=[["Gospodin je pastir moj: ni u čem ja ne oskudijevam.","Ps 23, 1"],["Sve mogu u Onome koji me jača.","Fil 4, 13"],["Ja sam put i istina i život.","Iv 14, 6"],["Blago mirotvorcima: oni će se sinovima Božjim zvati.","Mt 5, 9"],["Ne boj se, jer ja sam s tobom.","Iz 41, 10"],["Gospodin je svjetlost moja i spasenje: koga da se bojim?","Ps 27, 1"],["Uzdaj se u Gospodina svim srcem svojim.","Izr 3, 5"],["Ljubite jedni druge kao što sam ja vas ljubio.","Iv 15, 12"],["Ostanite u mojoj ljubavi.","Iv 15, 9"],["Neka vam srca ne budu uznemirena.","Iv 14, 1"],["Mir vam svoj dajem.","Iv 14, 27"],["Radujte se u nadi, budite strpljivi u nevolji, ustrajni u molitvi.","Rim 12, 12"],["Sve što činite, činite iz srca kao Gospodinu.","Kol 3, 23"],["Bog je ljubav.","1 Iv 4, 8"],["Gospodin je blizu onima koji su skršena srca.","Ps 34, 19"],["Prepusti Gospodinu putove svoje, u njega se uzdaj i on će sve voditi.","Ps 37, 5"],["Tvoja riječ nozi je mojoj svjetiljka i svjetlo mojoj stazi.","Ps 119, 105"],["Blagoslovljen čovjek koji se uzda u Gospodina.","Jr 17, 7"],["Gospodin je dobar, dovijeka je ljubav njegova.","Ps 100, 5"],["Tražite najprije Kraljevstvo i pravednost njegovu.","Mt 6, 33"],["Dođite k meni svi koji ste izmoreni i opterećeni i ja ću vas odmoriti.","Mt 11, 28"],["Ne sudite, da ne budete suđeni.","Mt 7, 1"],["Što god želite da ljudi vama čine, činite i vi njima.","Mt 7, 12"],["Tko ostaje u meni i ja u njemu, taj donosi mnogo roda.","Iv 15, 5"],["Ja sam uskrsnuće i život.","Iv 11, 25"],["Blago onima koji su čista srca: oni će Boga gledati.","Mt 5, 8"],["Blago krotkima: oni će baštiniti zemlju.","Mt 5, 5"],["Blago gladnima i žednima pravednosti: oni će se nasititi.","Mt 5, 6"],["Neka se ne umaraš čineći dobro.","Gal 6, 9"],["U svemu zahvaljujte!","1 Sol 5, 18"],["Gospodin neka te blagoslovi i neka te čuva!","Br 6, 24"]];
  var now=new Date();
  var startOfYear=new Date(now.getFullYear(),0,1);
  var dayOfYear=Math.floor((now-startOfYear)/86400000);
  var dailyQuote=bibleQuotes[((dayOfYear%bibleQuotes.length)+bibleQuotes.length)%bibleQuotes.length];

  var html='<section class="ps-home-flow" aria-label="Tematske priče PatriaSoula">'
    +'<div class="ps-home-flow-intro ps-daily-bible-quote">'
    +'<span class="kicker">BIBLIJSKI CITAT DANA</span>'
    +'<blockquote id="ps-daily-bible-text">„'+esc(dailyQuote[0])+'”</blockquote>'
    +'<p class="ps-daily-bible-ref" id="ps-daily-bible-ref">'+esc(dailyQuote[1])+'</p>'
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