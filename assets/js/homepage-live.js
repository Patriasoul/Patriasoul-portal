(function(){
  "use strict";

  /* PatriaSoul — živi moduli naslovnice: najnovije + vrijeme.
     Namjerno je samostalan kako ticker i vrijeme ne bi ovisili o drugom modulu. */
  var ticker=document.getElementById("breaking-ticker-track");
  var data=window.PatriaSoulContent&&window.PatriaSoulContent.articles||{};
  var articles=Object.keys(data).map(function(k){return data[k];})
    .filter(function(a){return a&&a.url&&a.title;})
    .sort(function(a,b){return (b.date||"").localeCompare(a.date||"");});

  if(ticker){
    var fallback=[
      ["Domovina","clanak-trpinjska-cesta.html","Trpinjska cesta: ljudi iza jedne od najpoznatijih priča obrane Vukovara"],
      ["Domovina","clanak-blago-zadro.html","Spomenik Blagi Zadri u Vukovaru: čovjek i zapovjednik"],
      ["Domovina","clanak-marko-babic.html","Marko Babić: Trpinjska cesta, protuoklopna borba i život poslije Vukovara"],
      ["Povijest","clanak-krbavska-bitka.html","Krbavska bitka 1493.: dan koji je ostao zapisan u hrvatskom sjećanju"],
      ["Dijaspora","clanak-australski-hrvati.html","Kad hrvatska riječ živi tisućama kilometara od domovine"],
      ["Vjera","clanak-vjera-obitelj.html","Vjera koja se prenosi: od obitelji do svakodnevice"]
    ];
    var items=articles.slice(0,8).map(function(a){
      return [a.category||a.rubric||"PRIČA",a.url,a.title];
    });
    if(!items.length)items=fallback;
    var html=items.map(function(x){return '<a href="'+x[1]+'">'+x[0]+' · '+x[2]+'</a>';})
      .join('<span class="breaking-sep">•</span>');
    ticker.innerHTML=html+'<span class="breaking-sep">•</span>'+html;
    ticker.setAttribute("data-ready","true");
  }

  /* Fallback za istaknutu priču: naslovnica mora prikazati sadržaj i ako content-data.js ne učita iz cachea. */
  var leadTitle=document.getElementById("home-lead-title");
  var leadImage=document.getElementById("home-lead-image");
  var topStories=document.getElementById("home-top-stories");
  if(leadTitle && !leadTitle.textContent.trim()){
    var featured={
      title:"Trpinjska cesta: ljudi iza jedne od najpoznatijih priča obrane Vukovara",
      deck:"U jesen 1991. godine Trpinjska cesta u Borovu Naselju postala je jedno od ključnih mjesta obrane Vukovara. Iza naziva koji je ostao zapisan u hrvatskom ratnom sjećanju stajali su konkretni ljudi, zapovjednici, policajci, vojnici i dragovoljci.",
      meta:"Piše: Čuvari nasljeđa · 20. rujna 2026. · Vukovar · 8 min čitanja",
      url:"clanak-trpinjska-cesta.html",
      image:"https://commons.wikimedia.org/wiki/Special:FilePath/Croatian%20War%201991%20Vukovar%20street.jpg"
    };
    leadTitle.textContent=featured.title;
    var deck=document.getElementById("home-lead-deck");
    var meta=document.getElementById("home-lead-meta");
    var link=document.getElementById("home-lead-link");
    var label=document.getElementById("home-lead-label");
    if(deck)deck.textContent=featured.deck;
    if(meta)meta.textContent=featured.meta;
    if(link)link.href=featured.url;
    if(label)label.textContent="BRANITELJSKE PRIČE · DOMOVINA";
    if(leadImage){
      leadImage.style.backgroundImage="url('"+featured.image+"')";
      leadImage.style.backgroundSize="cover";
      leadImage.style.backgroundPosition="center";
      var mark=leadImage.querySelector("span");
      if(mark)mark.textContent="Vukovar · 1991.";
    }
    if(topStories && !topStories.innerHTML.trim()){
      topStories.innerHTML=
        '<article class="side-story"><span class="section-label">LJUDI DOMOVINSKOG RATA</span><h3><a href="clanak-blago-zadro.html">Spomenik Blagi Zadri u Vukovaru: čovjek i zapovjednik iza imena koje je ostalo vezano uz Trpinjsku cestu</a></h3><p>Priča o čovjeku, zapovjedniku i obrani Borova Naselja.</p></article>'+
        '<article class="side-story"><span class="section-label">LJUDI DOMOVINSKOG RATA</span><h3><a href="clanak-marko-babic.html">Marko Babić: Trpinjska cesta, protuoklopna borba i život poslije Vukovara</a></h3><p>Od protuoklopne obrane Trpinjske ceste do života poslije Vukovara.</p></article>'+
        '<article class="side-story"><span class="section-label">POVIJESNE PRIČE</span><h3><a href="clanak-krbavska-bitka.html">Krbavska bitka 1493.: dan koji je ostao zapisan u hrvatskom sjećanju</a></h3><p>Jedna od ključnih priča hrvatske srednjovjekovne povijesti.</p></article>';
    }
  }

  var box=document.getElementById("weather-cities");
  var status=document.getElementById("weather-status");
  if(!box)return;

  var cities={Zagreb:[45.815,15.982],Split:[43.508,16.440],Rijeka:[45.327,14.442],Osijek:[45.555,18.695],Pula:[44.867,13.849],Zadar:[44.119,15.232]};
  var labels={0:"Vedro",1:"Pretežno vedro",2:"Djelomično oblačno",3:"Oblačno",45:"Magla",48:"Magla",51:"Rosulja",53:"Rosulja",55:"Rosulja",61:"Kiša",63:"Kiša",65:"Jaka kiša",71:"Snijeg",73:"Snijeg",75:"Jaki snijeg",80:"Pljuskovi",81:"Pljuskovi",82:"Jaki pljuskovi",95:"Grmljavina",96:"Grmljavina",99:"Grmljavina"};
  var names=Object.keys(cities), rows={};

  function render(){
    box.innerHTML=names.map(function(city){
      var x=rows[city];
      return '<span>'+city+' <b>'+(x&&x.temp!==null?x.temp+' °C':'—')+'</b><small>'+(x&&x.code!==null?(labels[x.code]||"Vrijeme"):"Podatak nije dostupan")+'</small></span>';
    }).join("");
  }

  box.innerHTML=names.map(function(city){return '<span>'+city+' <b>…</b><small>Učitavanje</small></span>';}).join("");
  if(status)status.textContent="Aktualno stanje · podaci se učitavaju";

  names.forEach(function(city){
    var p=cities[city];
    var url="https://api.open-meteo.com/v1/forecast?latitude="+p[0]+"&longitude="+p[1]+"&current=temperature_2m,weather_code&timezone=Europe%2FZagreb";
    var controller=window.AbortController?new AbortController():null;
    var timer=setTimeout(function(){if(controller)controller.abort();rows[city]={temp:null,code:null};render();},10000);
    fetch(url,{cache:"no-store",signal:controller?controller.signal:undefined})
      .then(function(r){if(!r.ok)throw new Error("HTTP "+r.status);return r.json();})
      .then(function(d){if(!d.current)throw new Error("Nema aktualnih podataka");rows[city]={temp:Math.round(Number(d.current.temperature_2m)),code:Number(d.current.weather_code)};})
      .catch(function(){rows[city]={temp:null,code:null};})
      .then(function(){clearTimeout(timer);render();});
  });
})();
