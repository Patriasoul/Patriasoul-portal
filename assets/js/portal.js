(() => {
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

  const currentPage = (window.location.pathname.split('/').pop() || 'index.html').toLowerCase();

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
      const normalized = href.toLowerCase();
      if (currentPage === normalized || (currentPage === '' && normalized === 'index.html')) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
      nav.appendChild(link);
    });

    const toggle = header.querySelector('.menu-toggle');
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.textContent = open ? 'Zatvori' : 'Izbornik';
    });
  }

  const footer = document.querySelector('.site-footer');
  if (footer) {
    footer.innerHTML = '<div class="container footer-grid"><div><strong class="footer-brand">PatriaSoul · Čuvari nasljeđa</strong><p>Čuvamo priče. Provjeravamo činjenice. Prenosimo nasljeđe.</p></div><div><strong>Temelji</strong><a href="vjera.html">✝️ Vjera</a><a href="ljudi.html">❤️ Obitelj</a><a href="domovina.html">🇭🇷 Domovina</a><a href="cuvari-nasljeda.html">🛡️ Čuvari nasljeđa</a></div><div><strong>O nama</strong><a href="o-nama.html">O PatriaSoul</a><a href="urednicki-standard.html">Urednički standard</a><a href="kontakt.html">Kontakt</a><a href="pretraga.html">Pretraga</a></div><small>PatriaSoul · Čuvari nasljeđa</small></div>';
  }
})();