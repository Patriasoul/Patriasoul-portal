(function(){
  "use strict";

  /* PatriaSoul — naslovnica: NAJNOVIJE + vrijeme */
  var ticker=document.getElementById("breaking-ticker-track");
  if(ticker){
    var items=[
      ["Domovina","clanak-trpinjska-cesta.html","Trpinjska cesta: ljudi iza jedne od najpoznatijih priča obrane Vukovara"],
      ["Domovina","clanak-blago-zadro.html","Spomenik Blagi Zadri u Vukovaru: čovjek i zapovjednik"],
      ["Domovina","clanak-marko-babic.html","Marko Babić: Trpinjska cesta, protuoklopna borba i život poslije Vukovara"],
      ["Povijest","clanak-krbavska-bitka.html","Krbavska bitka 1493.: dan koji je ostao zapisan u hrvatskom sjećanju"],
      ["Dijaspora","clanak-australski-hrvati.html","Kad hrvatska riječ živi tisućama kilometara od domovine"],
      ["Vjera","clanak-vjera-obitelj.html","Vjera koja se prenosi: od obitelji do svakodnevice"]
    ];
    var html=items.map(function(x){
      return '<a href="'+x[1]+'">'+x[0]+' · '+x[2]+'</a>';
    }).join('<span class="breaking-sep">•</span>');
    ticker.innerHTML=html+'<span class="breaking-sep">•</span>'+html;
    ticker.setAttribute("data-ready","true");
  }

  var cities={
    Zagreb:[45.815,15.982],
    Split:[43.508,16.440],
    Rijeka:[45.327,14.442],
    Osijek:[45.555,18.695],
    Pula:[44.867,13.849],
    Zadar:[44.119,15.232]
  };
  var labels={
    0:"Vedro",1:"Pretežno vedro",2:"Djelomično oblačno",3:"Oblačno",
    45:"Magla",48:"Magla",51:"Rosulja",53:"Rosulja",55:"Rosulja",
    61:"Kiša",63:"Kiša",65:"Jaka kiša",71:"Snijeg",73:"Snijeg",75:"Jaki snijeg",
    80:"Pljuskovi",81:"Pljuskovi",82:"Jaki pljuskovi",
    95:"Grmljavina",96:"Grmljavina",99:"Grmljavina"
  };

  var box=document.getElementById("weather-cities");
  var status=document.getElementById("weather-status");
  if(!box)return;

  var names=Object.keys(cities);
  var rows={};

  function render(){
    box.innerHTML=names.map(function(city){
      var x=rows[city];
      return '<span>'+city+' <b>'+(x&&x.temp!==null?x.temp+' °C':'—')+'</b><small>'+
        (x&&x.code!==null?(labels[x.code]||"Vrijeme"):"Podatak nije dostupan")+
        '</small></span>';
    }).join("");
  }

  box.innerHTML=names.map(function(city){
    return '<span>'+city+' <b>…</b><small>Učitavanje</small></span>';
  }).join("");

  if(status)status.textContent="Aktualno stanje · učitavanje podataka";

  names.forEach(function(city){
    var p=cities[city];
    var url="https://api.open-meteo.com/v1/forecast?latitude="+p[0]+
      "&longitude="+p[1]+"&current=temperature_2m,weather_code&timezone=Europe%2FZagreb";
    var controller=window.AbortController?new AbortController():null;
    var timer=setTimeout(function(){
      if(controller)controller.abort();
      rows[city]={temp:null,code:null};
      render();
    },8000);

    fetch(url,{cache:"no-store",signal:controller?controller.signal:undefined})
      .then(function(r){
        if(!r.ok)throw new Error("HTTP "+r.status);
        return r.json();
      })
      .then(function(d){
        if(!d.current)throw new Error("Nema aktualnih podataka");
        rows[city]={
          temp:Math.round(Number(d.current.temperature_2m)),
          code:Number(d.current.weather_code)
        };
      })
      .catch(function(){
        rows[city]={temp:null,code:null};
      })
      .then(function(){
        clearTimeout(timer);
        render();
      });
  });
})();