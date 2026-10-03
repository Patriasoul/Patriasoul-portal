/* PatriaSoul — Vrijeme Hrvatske
   Aktualni podaci i prognoza: Open-Meteo. Referentni službeni meteorološki izvor: DHMZ. */
(function(){
  "use strict";

  var cities=[
["Zagreb",45.815,15.982,"Zagreb i okolica"],["Split",43.508,16.440,"Srednja Dalmacija"],["Rijeka",45.327,14.442,"Kvarner"],
["Osijek",45.555,18.695,"Slavonija"],["Pula",44.867,13.849,"Istra"],["Zadar",44.119,15.232,"Sjeverna Dalmacija"],
["Dubrovnik",42.650,18.094,"Južna Dalmacija"],["Šibenik",43.735,15.895,"Sjeverna Dalmacija"],["Varaždin",46.305,16.336,"Sjeverozapadna Hrvatska"],
["Karlovac",45.492,15.555,"Središnja Hrvatska"],["Sisak",45.487,16.375,"Središnja Hrvatska"],["Slavonski Brod",45.160,18.015,"Slavonija"],
["Gospić",44.546,15.375,"Gorska Hrvatska"],["Knin",44.040,16.200,"Dalmatinska zagora"],["Makarska",43.296,17.017,"Srednja Dalmacija"],
["Pazin",45.240,13.936,"Istra"],["Vukovar",45.352,19.002,"Slavonija"],["Čakovec",46.391,16.442,"Sjeverozapadna Hrvatska"],
["Bjelovar",45.898,16.842,"Središnja Hrvatska"],["Krapina",46.160,15.879,"Sjeverozapadna Hrvatska"]
];

  var labels={
    0:"Vedro",1:"Pretežno vedro",2:"Djelomično oblačno",3:"Oblačno",
    45:"Magla",48:"Magla",51:"Slaba rosulja",53:"Rosulja",55:"Jača rosulja",
    56:"Ledena rosulja",57:"Jača ledena rosulja",61:"Slaba kiša",63:"Kiša",
    65:"Jaka kiša",66:"Ledena kiša",67:"Jaka ledena kiša",71:"Slab snijeg",
    73:"Snijeg",75:"Jaki snijeg",77:"Snježna zrna",80:"Pljuskovi",
    81:"Pljuskovi",82:"Jaki pljuskovi",85:"Snježni pljuskovi",
    86:"Jaki snježni pljuskovi",95:"Grmljavina",96:"Grmljavina i tuča",
    99:"Grmljavina i tuča"
  };

  var icons={
    0:"☀️",1:"🌤️",2:"⛅",3:"☁️",45:"🌫️",48:"🌫️",51:"🌦️",53:"🌦️",
    55:"🌧️",56:"🌧️",57:"🌧️",61:"🌧️",63:"🌧️",65:"🌧️",66:"🌧️",
    67:"🌧️",71:"🌨️",73:"❄️",75:"❄️",77:"🌨️",80:"🌦️",81:"🌦️",
    82:"⛈️",85:"🌨️",86:"🌨️",95:"⛈️",96:"⛈️",99:"⛈️"
  };

  var currentBox=document.getElementById("weather-current-grid");
  var forecastBox=document.getElementById("weather-forecast-body");
  var status=document.getElementById("weather-live-status");
  var lastUpdated=document.getElementById("weather-updated");
  var results={}; var selectedCity="Zagreb"; var selectedRegion="Hrvatska"; var cs=document.getElementById("weather-city-select"); var rs=document.getElementById("weather-region-select"); if(cs){cs.innerHTML="";cities.forEach(function(c){var o=document.createElement("option");o.value=c[0];o.textContent=c[0]+" · "+c[3];cs.appendChild(o);});} if(rs){rs.innerHTML="";["Hrvatska","Istra","Kvarner","Zagreb i okolica","Središnja Hrvatska","Sjeverozapadna Hrvatska","Gorska Hrvatska","Slavonija","Sjeverna Dalmacija","Srednja Dalmacija","Južna Dalmacija","Dalmatinska zagora"].forEach(function(r){var o=document.createElement("option");o.value=r;o.textContent=r;rs.appendChild(o);});}

  function esc(s){
    return String(s).replace(/[&<>"']/g,function(c){
      return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];
    });
  }
  function kmh(x){return Math.round(Number(x)*3.6);}
  function mm(x){return x==null?"—":Math.round(Number(x)*10)/10+" mm";}
  function time(s){
    return s?new Date(s).toLocaleTimeString("hr-HR",{hour:"2-digit",minute:"2-digit"}):"—";
  }
  function date(s){
    return s?new Date(s+"T12:00:00").toLocaleDateString("hr-HR",{weekday:"long",day:"2-digit",month:"2-digit."}):"—";
  }

  function renderCurrent(){
    if(!currentBox)return;
    currentBox.innerHTML=cities.map(function(c){
      var d=results[c[0]];
      if(d && d.error){
        return '<article class="weather-city-card"><div class="weather-city-head"><div><h3>'+esc(c[0])+'</h3><small>Hrvatska</small></div><div class="weather-temp">—</div></div><div class="weather-loading">Podaci trenutno nisu dostupni.</div></article>';
      }
      if(!d){
        return '<article class="weather-city-card"><div class="weather-city-head"><div><h3>'+esc(c[0])+'</h3><small>Hrvatska</small></div><div class="weather-temp">…</div></div><div class="weather-loading">Učitavanje podataka…</div></article>';
      }
      var cur=d.current;
      return '<article class="weather-city-card"><div class="weather-city-head"><div><h3>'+esc(c[0])+'</h3><small>'+esc(labels[cur.weather_code]||"Vrijeme")+'</small></div><div class="weather-temp">'+Math.round(cur.temperature_2m)+" °C</div></div><div class="weather-desc">"+(icons[cur.weather_code]||"🌤️")+" "+esc(labels[cur.weather_code]||"Vrijeme")+'</div><div class="weather-metrics"><div class="weather-metric"><span>Osjećaj</span><b>'+Math.round(cur.apparent_temperature)+' °C</b></div><div class="weather-metric"><span>Vjetar</span><b>'+kmh(cur.wind_speed_10m)+' km/h</b></div><div class="weather-metric"><span>Udari</span><b>'+kmh(cur.wind_gusts_10m)+'</b></div><div class="weather-metric"><span>Vlaga</span><b>'+Math.round(cur.relative_humidity_2m)+' %</b></div><div class="weather-metric"><span>Tlak</span><b>'+Math.round(cur.pressure_msl)+' hPa</b></div><div class="weather-metric"><span>UV</span><b>'+Math.round(cur.uv_index*10)/10+'</b></div><div class="weather-metric"><span>Oborina</span><b>'+mm(cur.precipitation)+'</b></div><div class="weather-metric"><span>Vidljivost</span><b>'+(cur.visibility/1000).toFixed(1)+' km</b></div></div><div class="weather-updated">Ažurirano: '+time(cur.time)+'</div></article>';
    }).join("");
  }

  function windDirection(deg){if(deg==null)return "—";var a=["S","SI","I","JI","J","JZ","Z","SZ"];return a[Math.round(Number(deg)/45)%8];}
  function renderDetail(){var box=document.getElementById("weather-detail"),d=results[selectedCity];if(!box||!d||d.error)return;var x=d.current;box.innerHTML="<div class=\"weather-detail-main\"><div><span class=\"weather-eyebrow\">ODABRANI GRAD</span><h2>"+esc(selectedCity)+"</h2><div class=\"weather-big\">"+(icons[x.weather_code]||"🌤️")+" "+Math.round(x.temperature_2m)+" °C</div><p>"+esc(labels[x.weather_code]||"Vrijeme")+" · osjećaj "+Math.round(x.apparent_temperature)+" °C</p></div><div class=\"weather-detail-grid\">"+metric("Vlažnost",Math.round(x.relative_humidity_2m)+" %")+metric("Vjetar",kmh(x.wind_speed_10m)+" km/h")+metric("Smjer",windDirection(x.wind_direction_10m))+metric("Udari",kmh(x.wind_gusts_10m)+" km/h")+metric("Tlak",Math.round(x.pressure_msl)+" hPa")+metric("UV indeks",x.uv_index==null?"—":Math.round(x.uv_index*10)/10)+metric("Vidljivost",x.visibility==null?"—":(x.visibility/1000).toFixed(1)+" km")+metric("Naoblaka",Math.round(x.cloud_cover||0)+" %")+"</div></div>";}
  function metric(a,b){return "<div class=\"weather-metric\"><span>"+a+"</span><b>"+b+"</b></div>";}
  function renderHourly(){var box=document.getElementById("weather-hourly"),d=results[selectedCity];if(!box||!d||d.error||!d.hourly)return;var h=d.hourly,n=Math.min(24,h.time.length);box.innerHTML="<div class=\"weather-section-heading\"><div><span class=\"weather-eyebrow\">SATNA PROGNOZA</span><h3>Sljedeća 24 sata · "+esc(selectedCity)+"</h3></div></div><div class=\"hourly-scroll\"><div class=\"hourly-row\">"+Array.from({length:n},function(_,i){return "<article class=\"hour-card\"><b>"+time(h.time[i])+"</b><strong>"+(icons[h.weather_code[i]]||"🌤️")+"</strong><em>"+Math.round(h.temperature_2m[i])+"°</em><span>"+Math.round(h.relative_humidity_2m[i])+"% vlage</span><span>"+kmh(h.wind_speed_10m[i])+" km/h</span><span>"+Math.round(h.precipitation_probability[i]||0)+"% kiše</span></article>";}).join("")+"</div></div>";}
  function renderRisk(){var box=document.getElementById("weather-risk"),d=results[selectedCity];if(!box||!d||d.error)return;var x=d.current,items=[];if(Number(x.wind_gusts_10m)>=70)items.push("🔴 Jaki udari vjetra — provjeri službena DHMZ upozorenja.");else if(Number(x.wind_gusts_10m)>=50)items.push("🟠 Pojačani udari vjetra — provjeri DHMZ.");else if(Number(x.wind_gusts_10m)>=35)items.push("🟡 Vjetrovito — povećan oprez.");if(Number(x.weather_code)>=95)items.push("🔴 Grmljavina — provjeri službena DHMZ upozorenja.");if(x.visibility!=null&&x.visibility<2000)items.push("🟡 Smanjena vidljivost.");box.innerHTML=(items.length?items:["🟢 Nema istaknutog lokalnog rizika prema trenutno dohvaćenim podacima."]).map(function(t){return "<div class=\"weather-risk-item\">"+t+"</div>";}).join("");}

  function renderForecast(){
    if(!forecastBox)return;
    var city=results[selectedCity] || results["Zagreb"];
    if(!city || city.error){
      forecastBox.innerHTML='<tr><td colspan="7" class="weather-loading">Prognoza trenutno nije dostupna. Pokušajte ponovno za nekoliko trenutaka.</td></tr>';
      return;
    }
    var d=city.daily;
    if(!d || !Array.isArray(d.time)){
      forecastBox.innerHTML='<tr><td colspan="7" class="weather-loading">Podaci prognoze nisu dostupni.</td></tr>';
      return;
    }
    forecastBox.innerHTML=d.time.map(function(day,i){
      return '<tr><td><strong>'+esc(date(day))+'</strong></td><td>'+(icons[d.weather_code[i]]||"🌤️")+' '+esc(labels[d.weather_code[i]]||"Vrijeme")+'</td><td>'+Math.round(d.temperature_2m_max[i])+' °C</td><td>'+Math.round(d.temperature_2m_min[i])+' °C</td><td>'+Math.round(d.precipitation_probability_max[i]||0)+' %</td><td>'+mm(d.precipitation_sum[i])+'</td><td>'+kmh(d.wind_speed_10m_max[i])+' km/h</td></tr>';
    }).join("");
  }

  function request(url,attempt){
    attempt=attempt||0;
    return fetch(url,{cache:"no-store",headers:{Accept:"application/json"}}).then(function(r){
      if(!r.ok)throw new Error("HTTP "+r.status);
      return r.json();
    }).catch(function(err){
      if(attempt<2){
        return new Promise(function(resolve){setTimeout(resolve,800*(attempt+1));}).then(function(){
          return request(url,attempt+1);
        });
      }
      throw err;
    });
  }

  function loadCity(c){
    var url="https://api.open-meteo.com/v1/forecast?latitude="+c[1]+"&longitude="+c[2]+"&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,wind_direction_10m,wind_gusts_10m,pressure_msl,cloud_cover,visibility,uv_index&hourly=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,wind_direction_10m,visibility,pressure_msl,uv_index&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,precipitation_sum,wind_speed_10m_max,wind_gusts_10m_max,wind_direction_10m_dominant,uv_index_max,sunrise,sunset&timezone=Europe%2FZagreb&forecast_days=7&forecast_hours=24";
    return request(url).then(function(d){
      results[c[0]]=d;
    }).catch(function(){
      results[c[0]]={error:true};
    }).then(function(){
      renderCurrent();
      if(c[0]===selectedCity){renderForecast();renderDetail();renderHourly();renderRisk();}
    });
  }

  function loadAll(){
    results={};
    renderCurrent();
    renderForecast();
    if(status)status.textContent="Dohvaćanje aktualnih podataka…";

    // Ne šaljemo 20 zahtjeva istodobno: to može izazvati ograničenje API-ja.
    var index=0;
    function nextBatch(){
      var batch=cities.slice(index,index+4);
      index+=4;
      if(!batch.length){
        var ok=Object.keys(results).some(function(k){return results[k] && !results[k].error;});
        if(status)status.textContent=ok
          ?"Podaci se učitavaju uživo. Za službena upozorenja pogledajte DHMZ."
          :"Vremenski servis trenutno nije dostupan. Pokušajte ponovno.";
        if(lastUpdated)lastUpdated.textContent=ok?"Zadnje dohvaćanje: "+new Date().toLocaleString("hr-HR"):"";
        renderCurrent();
        renderForecast();renderDetail();renderHourly();renderRisk();
        return Promise.resolve();
      }
      return Promise.all(batch.map(loadCity)).then(function(){return nextBatch();});
    }
    return nextBatch();
  }

  if(cs){cs.value=selectedCity;cs.addEventListener("change",function(){selectedCity=this.value;renderForecast();});} if(rs){rs.value=selectedRegion;rs.addEventListener("change",function(){selectedRegion=this.value;var list=selectedRegion==="Hrvatska"?cities:cities.filter(function(c){return c[3]===selectedRegion;});selectedCity=list.length?list[0][0]:"Zagreb";cs.value=selectedCity;renderCurrent();renderForecast();});} loadAll();

  var refresh=document.getElementById("weather-refresh");
  if(refresh){
    refresh.addEventListener("click",function(){
      refresh.disabled=true;
      refresh.textContent="↻ Osvježavanje…";
      loadAll().then(function(){
        refresh.disabled=false;
        refresh.textContent="↻ Osvježi podatke";
      });
    });
  }
})();