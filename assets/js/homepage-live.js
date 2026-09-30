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
    var items=articles.slice(0,8).map(function(a){
      return [a.category||a.rubric||"PRIČA",a.url,a.title];
    });
    var html=items.map(function(x){return '<a href="'+x[1]+'">'+x[0]+' · '+x[2]+'</a>';})
      .join('<span class="breaking-sep">•</span>');
    if(items.length){
      ticker.innerHTML=html+'<span class="breaking-sep">•</span>'+html;
      ticker.setAttribute("data-ready","true");
    } else {
      ticker.innerHTML='<span>PatriaSoul · nove priče uskoro</span>';
    }
  }

  /* Sadržaj naslovnice dolazi isključivo iz centralnog registra. */
  var leadTitle=document.getElementById("home-lead-title");
  var leadImage=document.getElementById("home-lead-image");
  if(leadTitle && !articles.length){
    leadTitle.textContent="Nove priče uskoro";
    var emptyDeck=document.getElementById("home-lead-deck");
    if(emptyDeck) emptyDeck.textContent="PatriaSoul trenutno nema dostupnih objavljenih priča.";
    var emptyMeta=document.getElementById("home-lead-meta");
    if(emptyMeta) emptyMeta.textContent="Sadržaj se učitava iz uredničkog registra.";
    var emptyLink=document.getElementById("home-lead-link");
    if(emptyLink) { emptyLink.href="rubrike.html"; emptyLink.textContent="Istraži rubrike"; }
    var emptyLabel=document.getElementById("home-lead-label");
    if(emptyLabel) emptyLabel.textContent="PATRIASOUL";
    if(leadImage){
      leadImage.style.backgroundImage="";
      leadImage.style.backgroundColor="rgba(0,0,0,.06)";
    }
  }

  var box=document.getElementById("weather-cities");
  var status=document.getElementById("weather-status");
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
