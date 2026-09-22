(() => {
  const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const seoPages = {
    'index.html': {title: 'PatriaSoul — Hrvatska, povijest, znanje i identitet', description: 'PatriaSoul donosi hrvatske priče, povijest, baštinu, vjeru, obitelj, domovinu i provjerene izvore.'},
    'vjera.html': {title: 'Vjera — PatriaSoul', description: 'Vjera, hrvatska kršćanska baština, svetišta, svjedočanstva i život vjere na PatriaSoul portalu.'},
    'obitelj.html': {title: 'Obitelj — PatriaSoul', description: 'Obitelj, međugeneracijske priče, sjećanja i vrijednosti koje se prenose dalje.'},
    'branitelji-hrvatska.html': {title: 'Branitelji Hrvatske — PatriaSoul', description: 'Dokumentirane priče o hrvatskim braniteljima, mjestima, događajima i svjedočanstvima.'},
    'hrvatska-danas.html': {title: 'Hrvatska danas — PatriaSoul', description: 'Najnovije objavljene priče PatriaSoula i aktualni vremenski podaci za hrvatske gradove.'},
    'domovina.html': {title: 'Domovina — PatriaSoul', description: 'Hrvatska kroz ljude, mjesta, sjećanja i priče o Domovini.'},
    'cuvari-nasljeda.html': {title: 'Čuvari nasljeđa — PatriaSoul', description: 'Priče o ljudima i zajednicama koje čuvaju hrvatsku baštinu, sjećanje i nasljeđe.'},
    'o-nama.html': {title: 'O PatriaSoul — Čuvari nasljeđa', description: 'Saznajte što je PatriaSoul, kako radimo i zašto su provjera izvora i očuvanje nasljeđa važni.'},
    'pretraga.html': {title: 'Pretraga — PatriaSoul', description: 'Pretražite priče, povijest, baštinu i druge sadržaje portala PatriaSoul.'},
    'kontakt.html': {title: 'Kontakt — PatriaSoul', description: 'Kontaktirajte PatriaSoul i pošaljite prijedlog priče, ispravak ili upit.'},
    'najnovije.html': {title: 'Najnovije — PatriaSoul', description: 'Najnovije objavljene priče PatriaSoula, uz aktualne vremenske podatke za hrvatske gradove.'},
    'povijest.html': {title: 'Povijest — PatriaSoul', description: 'Hrvatska povijest kroz provjerene priče, ljude, događaje i izvore.'},
    'urednicki-standard.html': {title: 'Urednički standard — PatriaSoul', description: 'Kako PatriaSoul provjerava izvore, razlikuje činjenice od svjedočanstava i ispravlja pogreške.'},
    'biblija.html': {title: 'Biblija — PatriaSoul', description: 'Biblija, vjera i hrvatska kršćanska baština na PatriaSoul portalu.'},
    'crkvena-bastina.html': {title: 'Crkvena baština — PatriaSoul', description: 'Crkve, sakralna baština, predaja i tragovi kršćanstva u Hrvatskoj.'},
    'dijaspora.html': {title: 'Hrvatska dijaspora — PatriaSoul', description: 'Priče o Hrvatima izvan Hrvatske, njihovoj povezanosti s domovinom i očuvanju identiteta.'},
    'hrvatska-stvara.html': {title: 'Hrvatska stvara — PatriaSoul', description: 'Hrvatska znanost, stvaralaštvo, izumi i ljudi koji su ostavili trag.'},
    'ljudi-vjere.html': {title: 'Ljudi vjere — PatriaSoul', description: 'Ljudi čiji su život i djelo povezani s vjerom, služenjem i hrvatskom baštinom.'},
    'povijest-crkve.html': {title: 'Povijest Crkve — PatriaSoul', description: 'Povijest Crkve i razvoj kršćanske baštine na hrvatskom prostoru.'},
    'svetista.html': {title: 'Svetišta — PatriaSoul', description: 'Hrvatska svetišta, hodočašća i mjesta kršćanske baštine.'},
    'svjedocanstva.html': {title: 'Svjedočanstva — PatriaSoul', description: 'Svjedočanstva, osobna sjećanja i životne priče povezane s vjerom i nasljeđem.'},
    'vjera-hrvatska-bastina.html': {title: 'Vjera i hrvatska baština — PatriaSoul', description: 'Povezanost vjere, hrvatske povijesti i kulturne baštine.'},
    'vjera-zivot.html': {title: 'Vjera i život — PatriaSoul', description: 'Vjera u svakodnevnom životu, obitelji i zajednici.'},
    'pravne-informacije.html': {title: 'Pravne informacije — PatriaSoul', description: 'Pravne informacije, autorska prava, izvori i pravila korištenja sadržaja portala PatriaSoul.'},
    'privatnost.html': {title: 'Privatnost — PatriaSoul', description: 'Informacije o privatnosti i obradi podataka na portalu PatriaSoul.'},
    'clanak-australski-hrvati.html': {title: 'Kad hrvatska riječ živi tisućama kilometara od domovine — PatriaSoul', description: 'Priča o Hrvatima izvan Hrvatske i očuvanju jezika, identiteta i povezanosti s domovinom.'},
    'clanak-blago-zadro.html': {title: 'Blago Zadro — PatriaSoul', description: 'Priča o Blagi Zadri, Vukovaru i obrani Trpinjske ceste tijekom Domovinskog rata.'},
    'clanak-krbavska-bitka.html': {title: 'Krbavska bitka 1493. — PatriaSoul', description: 'Povijesni pregled Krbavske bitke 1493. i njezina mjesta u hrvatskom povijesnom sjećanju.'},
    'clanak-marko-babic.html': {title: 'Marko Babić — PatriaSoul', description: 'Priča o Marku Babiću, Trpinjskoj cesti i protuoklopnoj borbi u obrani Vukovara.'},
    'clanak-marko-perkovic-thompson.html': {title: 'Marko Perković Thompson — PatriaSoul', description: 'Biografski pregled javno dostupnih podataka o Marku Perkoviću Thompsonu i njegovoj karijeri.'},
    'clanak-mihael-stosic.html': {title: 'Mihael Stošić — PatriaSoul', description: 'Priča o Mihaelu Stošiću, obiteljskom sjećanju i očuvanju uspomena.'},
    'clanak-penkala.html': {title: 'Eduard Slavoljub Penkala — PatriaSoul', description: 'Priča o Eduardu Slavoljubu Penkali, izumitelju i stvaralaštvu povezanom s Hrvatskom.'},
    'clanak-ruder-boskovic.html': {title: 'Ruđer Bošković — PatriaSoul', description: 'Život i djelo Ruđera Boškovića, Dubrovčanina i znanstvenika europskog značaja.'},
    'clanak-thompson-cavoglave.html': {title: 'Čavoglave i javni nastupi Marka Perkovića Thompsona — PatriaSoul', description: 'Dokumentirani pregled pjesme Čavoglave i njezina mjesta u javnom i glazbenom kontekstu.'},
    'clanak-thompson-glazba.html': {title: 'Marko Perković Thompson i glazba — PatriaSoul', description: 'Pregled glazbenog rada Marka Perkovića Thompsona i javno dostupnih podataka o njegovoj karijeri.'},
    'clanak-thompson-humanitarni-rad.html': {title: 'Marko Perković Thompson i humanitarni rad — PatriaSoul', description: 'Dokumentirani primjeri humanitarnog rada povezanog s Markom Perkovićem Thompsonom.'},
    'clanak-thompson-kontroverze.html': {title: 'Marko Perković Thompson — javne kontroverze i izvori — PatriaSoul', description: 'Pregled javno dokumentiranih kontroverzi povezanih s Markom Perkovićem Thompsonom uz navođenje izvora.'},
    'clanak-thompson-vjera-obitelj.html': {title: 'Marko Perković Thompson: vjera i obitelj — PatriaSoul', description: 'Javno dostupni podaci o vjeri, obitelji i životu Marka Perkovića Thompsona, uz odvajanje privatnog i javnog.'},
    'clanak-trpinjska-cesta.html': {title: 'Trpinjska cesta — PatriaSoul', description: 'Priča o Trpinjskoj cesti i ljudima koji su sudjelovali u obrani Vukovara tijekom Domovinskog rata.'},
    'clanak-vjera-obitelj.html': {title: 'Vjera koja se prenosi — PatriaSoul', description: 'Kako se vjera, običaji i sjećanja prenose kroz obiteljski život i svakodnevicu.'},
    'clanak-vlatko-gribl.html': {title: 'Vlatko Gribl i obiteljski zanat — PatriaSoul', description: 'Priča o Vlatku Griblu, obiteljskom zanatu i znanju koje se prenosilo generacijama.'},
    'clanak.html': {title: 'Priča — PatriaSoul', description: 'PatriaSoul priča o Hrvatskoj kroz povijest, ljude, mjesta, baštinu i provjerene izvore.'}
  };
  const seo = seoPages[currentPage] || {title: document.title || 'PatriaSoul — Čuvari nasljeđa', description: 'PatriaSoul — hrvatske priče, povijest, znanje, baština i identitet.'};
  document.title = seo.title;
  const upsertMeta = (name, content, attr='name') => {
    let el = document.head.querySelector('meta[' + attr + '="' + name + '"]');
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
    el.setAttribute('content', content);
  };
  const staticDescription = document.head.querySelector('meta[name="description"]');
  if (staticDescription && !seoPages[currentPage]) {
    // Preserve page-specific static descriptions on pages without a dedicated SEO entry.
  } else {
    upsertMeta('description', seo.description);
  }
  upsertMeta('og:type', 'website', 'property');
  upsertMeta('og:site_name', 'PatriaSoul', 'property');
  upsertMeta('og:locale', 'hr_HR', 'property');
  upsertMeta('og:title', seo.title, 'property');
  upsertMeta('og:description', seo.description, 'property');
  upsertMeta('og:url', window.location.href.split('#')[0], 'property');
  upsertMeta('og:image', 'https://raw.githubusercontent.com/Patriasoul/patriasoul/main/images/file_0000000082ec81f4a6fc17bdbd959622_114540.png', 'property');
  upsertMeta('twitter:card', 'summary', 'name');
  upsertMeta('twitter:title', seo.title, 'name');
  upsertMeta('twitter:description', seo.description, 'name');
  upsertMeta('twitter:image', 'https://raw.githubusercontent.com/Patriasoul/patriasoul/main/images/file_0000000082ec81f4a6fc17bdbd959622_114540.png', 'name');
  let canonical = document.head.querySelector('link[rel="canonical"]');
  if (!canonical) { canonical = document.createElement('link'); canonical.rel = 'canonical'; document.head.appendChild(canonical); }
  canonical.href = window.location.origin + window.location.pathname;
  let favicon = document.head.querySelector('link[rel="icon"]');
  if (!favicon) { favicon = document.createElement('link'); favicon.rel = 'icon'; favicon.type = 'image/png'; document.head.appendChild(favicon); }
  favicon.href = 'https://raw.githubusercontent.com/Patriasoul/patriasoul/main/images/file_0000000082ec81f4a6fc17bdbd959622_114540.png';
  upsertMeta('theme-color', '#8b0000');

  const navItems = [
    {href:'index.html', label:'🏠 Naslovnica'},
    {href:'vjera.html', label:'✝️ Vjera', children:[
      ['vjera-zivot.html','Vjera i život'],
      ['biblija.html','Biblija'],
      ['svetista.html','Svetišta'],
      ['crkvena-bastina.html','Crkvena baština'],
      ['povijest-crkve.html','Povijest Crkve'],
      ['ljudi-vjere.html','Ljudi vjere'],
      ['svjedocanstva.html','Svjedočanstva'],
      ['vjera-hrvatska-bastina.html','Vjera i hrvatska baština']
    ]},
    {href:'obitelj.html', label:'❤️ Obitelj', children:[
      ['clanak-vjera-obitelj.html','Vjera i obitelj']
    ]},
    {href:'domovina.html', label:'🇭🇷 Domovina', children:[
      ['povijest.html','Povijest'],
      ['branitelji-hrvatska.html','Branitelji Hrvatske'],
      ['hrvatska-danas.html','Hrvatska danas'],
      ['najnovije.html','Najnovije'],
      ['dijaspora.html','Dijaspora'],
      ['hrvatska-stvara.html','Hrvatska stvara']
    ]},
    {href:'cuvari-nasljeda.html', label:'🛡️ Čuvari nasljeđa', children:[
      ['cuvari-nasljeda.html','Pregled nasljeđa'],
      ['crkvena-bastina.html','Crkvena baština'],
      ['vjera-hrvatska-bastina.html','Vjera i hrvatska baština'],
      ['povijest.html','Povijest'],
      ['dijaspora.html','Hrvatska dijaspora']
    ]},
    {href:'o-nama.html', label:'🇭🇷 O PatriaSoul', children:[
      ['o-nama.html','O PatriaSoul'],
      ['urednicki-standard.html','Urednički standard'],
      ['pravne-informacije.html','Pravne informacije'],
      ['privatnost.html','Privatnost'],
      ['kontakt.html','Kontakt']
    ]},
    {href:'kontakt.html', label:'✉️ Kontakt'},
    {href:'https://patriasoul.github.io/kviz/', label:'🎮 Kviz PatriaSoul'},
    {href:'pretraga.html', label:'🔎 Pretraga'}
  ];


  const header = document.querySelector('.site-header');

  if (header) {
    header.innerHTML = `
      <div class="utility-bar"><div class="utility-inner"></div></div>
      <div class="topbar">
        <a class="brand" href="index.html" aria-label="PatriaSoul — Naslovnica">
          <span class="brand-mark" aria-hidden="true">🇭🇷</span>
          <span><strong>PatriaSoul</strong><small>Čuvari nasljeđa</small></span>
        </a>
        <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="main-nav">Izbornik</button>
      </div>
      <nav id="main-nav" class="main-nav" aria-label="Glavna navigacija"></nav>
    `;

    const utility = header.querySelector('.utility-inner');
    const date = document.createElement('span');
    date.className = 'utility-date';
    const days = ['Nedjelja','Ponedjeljak','Utorak','Srijeda','Četvrtak','Petak','Subota'];
    const months = ['siječnja','veljače','ožujka','travnja','svibnja','lipnja','srpnja','kolovoza','rujna','listopada','studenoga','prosinca'];
    const today = new Date();
    date.textContent = `${days[today.getDay()]}, ${today.getDate()}. ${months[today.getMonth()]} ${today.getFullYear()}.`;

    const social = document.createElement('a');
    social.className = 'utility-social';
    social.href = 'https://www.tiktok.com/@patriasoul?lang=hr';
    social.target = '_blank';
    social.rel = 'noopener noreferrer';
    social.setAttribute('aria-label', 'PatriaSoul na TikToku');
    social.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-3.91V2h-3.6v13.4a2.87 2.87 0 1 1-2.87-2.87c.3 0 .59.05.87.14V9a6.5 6.5 0 1 0 3.6 5.86V8.67a8.4 8.4 0 0 0 5.77 2.3V7.38c0-.01 0-.01 0-.01Z"/></svg><span>TikTok</span>';
    utility.replaceChildren(date, social);

    const nav = header.querySelector('#main-nav');
    navItems.forEach(item => {
      const wrap = document.createElement('div');
      wrap.className = 'nav-item' + (item.children ? ' has-submenu' : '');

      const link = document.createElement('a');
      link.href = item.href;
      link.textContent = item.label;
      if (item.href === 'pretraga.html') link.classList.add('nav-search');
      if (currentPage === item.href.toLowerCase()) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
      wrap.appendChild(link);

      if (item.children && item.children.length) {
        const submenu = document.createElement('div');
        submenu.className = 'nav-submenu';
        submenu.setAttribute('role','menu');

        item.children.forEach(([href,label]) => {
          const sub = document.createElement('a');
          sub.href = href;
          sub.textContent = label;
          sub.setAttribute('role','menuitem');
          if (currentPage === href.toLowerCase()) {
            sub.classList.add('active');
            sub.setAttribute('aria-current','page');
            wrap.classList.add('has-active-submenu');
          }
          submenu.appendChild(sub);
        });

        const arrow = document.createElement('button');
        arrow.type = 'button';
        arrow.className = 'submenu-toggle';
        arrow.setAttribute('aria-label', 'Otvori podizbornik');
        arrow.setAttribute('aria-expanded', 'false');
        arrow.innerHTML = '⌄';
        arrow.addEventListener('click', event => {
          event.preventDefault();
          event.stopPropagation();
          const open = wrap.classList.toggle('submenu-open');
          arrow.setAttribute('aria-expanded', String(open));
        });
        wrap.appendChild(arrow);
        wrap.appendChild(submenu);
      }

      nav.appendChild(wrap);
    });

    const toggle = header.querySelector('.menu-toggle');
    const closeMenu = () => {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = 'Izbornik';
    };

    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Zatvori' : 'Izbornik';
    });

    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        nav.querySelectorAll('.submenu-open').forEach(item => item.classList.remove('submenu-open'));
        nav.querySelectorAll('.submenu-toggle').forEach(btn => btn.setAttribute('aria-expanded','false'));
        closeMenu();
      }
    });
  }

  const footer = document.querySelector('.site-footer');
  if (footer) {
    footer.innerHTML = '<div class="container footer-grid"><div><strong class="footer-brand">PatriaSoul · Čuvari nasljeđa</strong><p>Čuvamo priče. Provjeravamo činjenice. Prenosimo nasljeđe.</p></div><div><strong>Temelji</strong><a href="vjera.html">✝️ Vjera</a><a href="obitelj.html">❤️ Obitelj</a><a href="domovina.html">🇭🇷 Domovina</a><a href="branitelji-hrvatska.html">🪖 Branitelji Hrvatske</a><a href="povijest.html">📚 Povijest</a><a href="cuvari-nasljeda.html">🛡️ Čuvari nasljeđa</a></div><div><strong>Istraži</strong><a href="hrvatska-danas.html">📰 Hrvatska danas</a><a href="dijaspora.html">🌍 Dijaspora</a><a href="hrvatska-stvara.html">🔧 Hrvatska stvara</a><a href="svjedocanstva.html">✝️ Svjedočanstva</a><a href="crkvena-bastina.html">⛪ Crkvena baština</a><a href="svetista.html">🕯️ Svetišta</a></div><div><strong>O nama</strong><a href="o-nama.html">O PatriaSoul</a><a href="urednicki-standard.html">Urednički standard</a><a href="pravne-informacije.html">Pravne informacije</a><a href="privatnost.html">Privatnost</a><a href="kontakt.html">Kontakt</a><a href="pretraga.html">Pretraga</a></div><small>PatriaSoul · Čuvari nasljeđa</small></div>';
  }
})();