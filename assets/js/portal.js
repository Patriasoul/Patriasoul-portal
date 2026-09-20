(() => {
  const header = document.querySelector('.site-header');
  if (!header) return;

  let utility = header.querySelector('.utility-inner');
  if (!utility) {
    const bar = document.createElement('div');
    bar.className = 'utility-bar';
    utility = document.createElement('div');
    utility.className = 'utility-inner';
    bar.appendChild(utility);
    header.insertBefore(bar, header.firstElementChild);
  }

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

  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? 'Zatvori' : 'Izbornik';
  });
})();