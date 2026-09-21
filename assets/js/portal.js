(() => {
  const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const seoPages = {
    'index.html': {title: 'PatriaSoul — Hrvatska, povijest, znanje i identitet', description: 'PatriaSoul donosi hrvatske priče, povijest, baštinu, vjeru, obitelj, domovinu i provjerene izvore.'},
    'vjera.html': {title: 'Vjera — PatriaSoul', description: 'Vjera, hrvatska kršćanska baština, svetišta, svjedočanstva i život vjere na PatriaSoul portalu.'},
    'ljudi.html': {title: 'Obitelj i ljudi — PatriaSoul', description: 'Ljudi, obitelj, vjera i priče koje oblikuju hrvatski identitet i nasljeđe.'},
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
    'vjera-zivot.html': {title: 'Vjera i život — PatriaSoul', description: 'Vjera u svakodnevnom životu, obitelji i zajednici.'}
  };
  const seo = seoPages[currentPage] || {title: document.title || 'PatriaSoul — Čuvari nasljeđa', description: 'PatriaSoul — hrvatske priče, povijest, znanje, baština i identitet.'};
  document.title = seo.title;
  const upsertMeta = (name, content, attr='name') => {
    let el = document.head.querySelector('meta[' + attr + '="' + name + '"]');
    if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
    el.setAttribute('content', content);
  };
  upsertMeta('description', seo.description);
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
    ['index.html', '🏠 Naslovnica'],
    ['vjera.html', '✝️ Vjera'],
    ['ljudi.html', '❤️ Obitelj'],
    ['domovina.html', '🇭🇷 Domovina'],
    ['cuvari-nasljeda.html', '🛡️ Čuvari nasljeđa'],
    ['o-nama.html', '🇭🇷 O PatriaSoul'],
    ['pretraga.html', '🔎 Pretraga'],
    ['kontakt.html', '✉️ Kontakt']
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
    navItems.forEach(([href, label]) => {
      const link = document.createElement('a');
      link.href = href;
      link.textContent = label;
      if (currentPage === href.toLowerCase()) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
      nav.appendChild(link);
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
      if (event.key === 'Escape') closeMenu();
    });
  }

  const footer = document.querySelector('.site-footer');
  if (footer) {
    footer.innerHTML = '<div class="container footer-grid"><div><strong class="footer-brand">PatriaSoul · Čuvari nasljeđa</strong><p>Čuvamo priče. Provjeravamo činjenice. Prenosimo nasljeđe.</p></div><div><strong>Temelji</strong><a href="vjera.html">✝️ Vjera</a><a href="ljudi.html">❤️ Obitelj</a><a href="domovina.html">🇭🇷 Domovina</a><a href="povijest.html">📚 Povijest</a><a href="cuvari-nasljeda.html">🛡️ Čuvari nasljeđa</a></div><div><strong>Istraži</strong><a href="dijaspora.html">🌍 Dijaspora</a><a href="hrvatska-stvara.html">🔧 Hrvatska stvara</a><a href="svjedocanstva.html">✝️ Svjedočanstva</a><a href="crkvena-bastina.html">⛪ Crkvena baština</a><a href="svetista.html">🕯️ Svetišta</a></div><div><strong>O nama</strong><a href="o-nama.html">O PatriaSoul</a><a href="urednicki-standard.html">Urednički standard</a><a href="pravne-informacije.html">Pravne informacije</a><a href="privatnost.html">Privatnost</a><a href="kontakt.html">Kontakt</a><a href="pretraga.html">Pretraga</a></div><small>PatriaSoul · Čuvari nasljeđa</small></div>';
  }
})();