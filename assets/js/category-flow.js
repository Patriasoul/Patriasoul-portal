/* PatriaSoul · zajednički tok kategorija
 * Slider + tematski blokovi + završne poveznice.
 * Podaci dolaze iz assets/js/content-data.js.
 */
(function () {
  "use strict";

  var configs = {
    "hrvatska-danas.html": {
      title: "Izdvojeno iz Hrvatske danas",
      intro: "Najnovije i važne teme iz Hrvatske, složene po područjima.",
      categories: ["Hrvatska danas", "Gospodarstvo", "Domovina", "Društvo", "Turizam"],
      links: [["Povijest", "povijest.html"], ["Vjera", "vjera.html"]]
    },
    "povijest.html": {
      title: "Izdvojeno iz povijesti",
      intro: "Priče o događajima, ljudima, mjestima i baštini koji su oblikovali Hrvatsku.",
      categories: ["Povijest", "Baština", "Ljudi Domovinskog rata", "Domovina", "Čuvari nasljeđa"],
      links: [["Domovina", "domovina.html"], ["Hrvatska stvara", "hrvatska-stvara.html"]]
    },
    "vjera.html": {
      title: "Izdvojeno iz vjere",
      intro: "Priče o vjeri, ljudima, svetištima i tradiciji hrvatskoga prostora.",
      categories: ["Vjera", "Ljudi vjere", "Crkvena baština", "Vjera i obitelj", "Svjedočanstva"],
      links: [["Obitelj", "obitelj.html"], ["Čuvari nasljeđa", "cuvari-nasljeda.html"]]
    },
    "obitelj.html": {
      title: "Izdvojeno iz obitelji",
      intro: "Priče o obitelji, odnosima, običajima i vrijednostima koje se prenose.",
      categories: ["Obitelj", "Vjera i obitelj", "Baština", "Vjera", "Svjedočanstva"],
      links: [["Vjera", "vjera.html"], ["Domovina", "domovina.html"]]
    },
    "domovina.html": {
      title: "Izdvojeno iz domovine",
      intro: "Povijest, ljudi, mjesta, obrana i suvremene teme hrvatske domovine.",
      categories: ["Domovina", "Braniteljske priče", "Ljudi Domovinskog rata", "Povijest", "Hrvatska danas"],
      links: [["Povijest", "povijest.html"], ["Hrvatska danas", "hrvatska-danas.html"]]
    },
    "dijaspora.html": {
      title: "Izdvojeno iz dijaspore",
      intro: "Priče o hrvatskim zajednicama, jeziku, kulturi i životu izvan domovine.",
      categories: ["Dijaspora", "Hrvatske zajednice", "Obitelj", "Vjera", "Domovina"],
      links: [["Domovina", "domovina.html"], ["Čuvari nasljeđa", "cuvari-nasljeda.html"]]
    },
    "hrvatska-stvara.html": {
      title: "Izdvojeno iz Hrvatske stvara",
      intro: "Ljudi, znanje, izumi, umjetnost i stvaralaštvo iz hrvatskoga prostora.",
      categories: ["Hrvatska stvara", "Znanost i izumi", "Ljudi", "Kultura", "Baština"],
      links: [["Povijest", "povijest.html"], ["Hrvatska danas", "hrvatska-danas.html"]]
    },
    "cuvari-nasljeda.html": {
      title: "Izdvojeno iz Čuvara nasljeđa",
      intro: "Osobne priče, svjedočanstva i ljudi koji čuvaju tragove prošlosti.",
      categories: ["Čuvari nasljeđa", "Sjećanje", "Svjedočanstva", "Baština", "Ljudi"],
      links: [["Domovina", "domovina.html"], ["Kontakt", "kontakt.html"]]
    }
  };

  var file = location.pathname.split("/").pop() || "index.html";
  var cfg = configs[file];
  var host = document.getElementById("ps-category-flow");
  var portal = window.PatriaSoulPortal;\n  if (!portal && window.PatriaSoulContent && window.PatriaSoulContent.articles) {\n    portal = { articles: Object.keys(window.PatriaSoulContent.articles).map(function(k){ return window.PatriaSoulContent.articles[k]; }) };\n  }
  if (!cfg || !host || !portal || !Array.isArray(portal.articles)) return;

  var articles = portal.articles.slice().sort(function(a,b){
    return String(b.date || "").localeCompare(String(a.date || ""));
  });

  function esc(v) {
    return String(v == null ? "" : v).replace(/[&<>"]/g, function(c) {
      return {"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c];
    });
  }

  function matches(a, category) {
    var hay = [
      a.category, a.subcategory, a.rubric,
      (a.tags || []).join(" ")
    ].join(" ").toLowerCase();
    return hay.indexOf(String(category).toLowerCase()) !== -1;
  }

  function card(a, compact) {
    var image = a.image ? '<a class="ps-card-image" href="'+esc(a.url)+'"><img src="'+esc(a.image)+'" alt="'+esc(a.imageAlt || a.title)+'" loading="lazy"></a>' : "";
    return '<article class="ps-story-card '+(compact ? "ps-story-card-compact" : "")+'">'+
      image+
      '<div class="ps-story-copy">'+
      '<span class="ps-card-label">'+esc(a.rubric || a.category || "PRIČA")+'</span>'+
      '<h3><a href="'+esc(a.url)+'">'+esc(a.title)+'</a></h3>'+
      '<p>'+esc(a.deck || "")+'</p>'+
      '<a class="ps-card-link" href="'+esc(a.url)+'">Pročitaj priču →</a>'+
      '</div></article>';
  }

  function section(label, items) {
    if (!items.length) return "";
    return '<section class="ps-topic-section">'+
      '<div class="ps-section-head"><div><span class="kicker">PATRIASOUL PRIČE</span><h2>'+esc(label)+'</h2></div>'+
      '<span class="ps-section-count">'+items.length+' '+(items.length === 1 ? "priča" : "priče")+'</span></div>'+
      '<div class="ps-topic-grid">'+items.slice(0,3).map(function(a){return card(a,true);}).join("")+'</div>'+
      '</section>';
  }

  var used = {};
  var featured = [];
  cfg.categories.forEach(function(cat) {
    articles.filter(function(a){return matches(a,cat);}).slice(0,3).forEach(function(a){
      if (!used[a.url] && featured.length < 8) {
        used[a.url] = true;
        featured.push(a);
      }
    });
  });

  var html = '<section class="ps-featured">'+
    '<div class="ps-section-head"><div><span class="kicker">IZDVOJENO</span><h2>'+esc(cfg.title)+'</h2><p>'+esc(cfg.intro)+'</p></div></div>'+
    '<div class="ps-slider" data-ps-slider><button class="ps-slider-btn ps-prev" type="button" aria-label="Prethodni članci">←</button>'+
    '<div class="ps-slider-track">'+featured.map(function(a){return card(a,false);}).join("")+'</div>'+
    '<button class="ps-slider-btn ps-next" type="button" aria-label="Sljedeći članci">→</button></div>'+
    '</section>';

  cfg.categories.forEach(function(cat) {
    var items = articles.filter(function(a){return matches(a,cat);}).slice(0,3);
    html += section(cat, items);
  });

  html += '<section class="ps-next-pages"><div class="ps-section-head"><div><span class="kicker">JOŠ IZ PATRIASOULA</span><h2>Istraži dalje</h2></div></div><div class="ps-next-grid">'+
    cfg.links.map(function(l){return '<a class="ps-next-block" href="'+esc(l[1])+'"><span>PatriaSoul</span><strong>'+esc(l[0])+'</strong><em>Otvori stranicu →</em></a>';}).join("")+
    '</div></section>';

  html += '<section class="ps-final-links"><a href="o-nama.html"><span>O PATRIASOULU</span><strong>Čuvamo priče. Provjeravamo činjenice.</strong><em>Saznaj više →</em></a><a href="kontakt.html"><span>KONTAKT</span><strong>Imaš priču, izvor ili ispravak?</strong><em>Javi nam se →</em></a></section>';

  host.innerHTML = html;

  var track = host.querySelector(".ps-slider-track");
  var prev = host.querySelector(".ps-prev");
  var next = host.querySelector(".ps-next");
  function move(dir) {
    if (!track) return;
    track.scrollBy({left: dir * Math.max(track.clientWidth * .78, 280), behavior:"smooth"});
  }
  if (prev) prev.addEventListener("click", function(){move(-1);});
  if (next) next.addEventListener("click", function(){move(1);});
})();
