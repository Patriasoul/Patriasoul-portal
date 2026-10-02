/* PatriaSoul — Vrijeme Hrvatske
   Aktualni podaci i prognoza: Open-Meteo. Referentni službeni meteorološki izvor: DHMZ. */
(function(){
  "use strict";
  var cities=[
    ["Zagreb",45.815,15.982],["Split",43.508,16.440],["Rijeka",45.327,14.442],
    ["Osijek",45.555,18.695],["Pula",44.867,13.849],["Zadar",44.119,15.232],
    ["Dubrovnik",42.650,18.094],["Šibenik",43.735,15.895],["Varaždin",46.305,16.336],
    ["Karlovac",45.492,15.555],["Sisak",45.487,16.375],["Slavonski Brod",45.160,18.015],
    ["Gospić",44.546,15.375],["Knin",44.040,16.200],["Makarska",43.296,17.017],
    ["Pazin",45.240,13.936],["Vukovar",45.352,19.002],["Čakovec",46.391,16.442],
    ["Bjelovar",45.898,16.842],["Krapina",46.160,15.879]
  ];
  var labels={0:"Vedro",1:"Pretežno vedro",2:"Djelomično oblačno",3:"Oblačno",45:"Magla",48:"Magla",51:"Slaba rosulja",53:"Rosulja",55:"Jača rosulja",56:"Ledena rosulja",57:"Jača ledena rosulja",61:"Slaba kiša",63:"Kiša",65:"Jaka kiša",66:"Ledena kiša",67:"Jaka ledena kiša",71:"Slab snijeg",73:"Snijeg",75:"Jaki snijeg",77:"Snježna zrna",80:"Pljuskovi",81:"Pljuskovi",82:"Jaki pljuskovi",85:"Snježni pljuskovi",86:"Jaki snježni pljuskovi",95:"Grmljavina",96:"Grmljavina i tuča",99:"Grmljavina i tuča"};
  var icons={0:"☀️",1:"🌤️",2:"⛅",3:"☁️",45:"🌫️",48:"🌫️",51:"🌦️",53:"🌦️",55:"🌧️",61:"🌧️",63:"🌧️",65:"🌧️",71:"🌨️",73:"❄️",75:"❄️",80:"🌦️",81:"🌦️",82:"⛈️",95:"⛈️",96:"⛈️",99:"⛈️"};
  var currentBox=document.getElementById("weather-current-grid");
  var forecastBox=document.getElementById("weather-forecast-body");
  var status=document.getElementById("weather-live-status");
  var lastUpdated=document.getElementById("weather-updated");
  var results={};
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c];});}
  function kmh(x){return Math.round(Number(x)*3.6);}
  function mm(x){return x==null?"—":Math.round(Number(x)*10)/10+" mm";}
  function time(s){return s?new Date(s).toLocaleTimeString("hr-HR",{hour:"2-digit",minute:"2-digit"}):"—";}
  function date(s){return s?new Date(s+"T12:00:00").toLocaleDateString("hr-HR",{weekday:"long",day:"2-digit",month:"2-digit."}):"—";}
  function renderCurrent(){
    if(!currentBox)return;
    currentBox.innerHTML=cities.map(function(c){
      var d=results[c[0]];
      if(!d)return '<article class="weather-city-card"><div class="weather-city-head"><div><h3>'+esc(c[0])+'</h3><small>Hrvatska</small></div><div class="weather-temp">…</div></div><div class="weather-loading">Učitavanje podataka…</div></article>';
      var cur=d.current;
      return '<article class="weather-city-card"><div class="weather-city-head"><div><h3>'+esc(c[0])+'</h3><small>'+esc(labels[cur.weather_code]||"Vrijeme")+'</small></div><div class="weather-temp">'+Math.round(cur.temperature_2m)+' °C</div></div><div class="weather-desc">'+(icons[cur.weather_code]||"🌤️")+' '+esc(labels[cur.weather_code]||"Vrijeme")+'</div><div class="weather-metrics"><div class="weather-metric"><span>Osjećaj</span><b>'+Math.round(cur.apparent_temperature)+' °C</b></div><div class="weather-metric"><span>Vjetar</span><b>'+kmh(cur.wind_speed_10m)+' km/h</b></div><div class="weather-metric"><span>Vlaga</span><b>'+Math.round(cur.relative_humidity_2m)+' %</b></div><div class="weather-metric"><span>Oborina</span><b>'+mm(cur.precipitation)+'</b></div></div><div class="weather-updated">Ažurirano: '+time(cur.time)+'</div></article>';
    }).join("");
  }
  function renderForecast(){
    if(!forecastBox)return;
    var city=results["Zagreb"];
    if(!city){forecastBox.innerHTML='<tr><td colspan="7" class="weather-loading">Učitavanje prognoze…</td></tr>';return;}
    var d=city.daily;
    forecastBox.innerHTML=d.time.map(function(day,i){
      return '<tr><td><strong>'+esc(date(day))+'</strong></td><td>'+(icons[d.weather_code[i]]||"🌤️")+' '+esc(labels[d.weather_code[i]]||"Vrijeme")+'</td><td>'+Math.round(d.temperature_2m_max[i])+' °C</td><td>'+Math.round(d.temperature_2m_min[i])+' °C</td><td>'+Math.round(d.precipitation_probability_max[i]||0)+' %</td><td>'+mm(d.precipitation_sum[i])+'</td><td>'+kmh(d.wind_speed_10m_max[i])+' km/h</td></tr>';
    }).join("");
  }
  function loadCity(c){
    var url="https://api.open-meteo.com/v1/forecast?latitude="+c[1]+"&longitude="+c[2]+"&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,sunrise,sunset&timezone=Europe%2FZagreb&forecast_days=7";
    return fetch(url,{cache:"no-store"}).then(function(r){if(!r.ok)throw new Error("HTTP "+r.status);return r.json();}).then(function(d){results[c[0]]=d;renderCurrent();if(c[0]==="Zagreb")renderForecast();}).catch(function(){results[c[0]]=null;renderCurrent();});
  }
  renderCurrent();
  Promise.all(cities.map(loadCity)).then(function(){
    if(status)status.textContent="Podaci se učitavaju uživo. Za službena upozorenja i meteorološke informacije pogledajte DHMZ.";
    if(lastUpdated)lastUpdated.textContent="Zadnje dohvaćanje: "+new Date().toLocaleString("hr-HR");
    renderForecast();
  });
  var refresh=document.getElementById("weather-refresh");
  if(refresh)refresh.addEventListener("click",function(){results={};renderCurrent();renderForecast();Promise.all(cities.map(loadCity)).then(function(){if(lastUpdated)lastUpdated.textContent="Zadnje dohvaćanje: "+new Date().toLocaleString("hr-HR");});});
})();