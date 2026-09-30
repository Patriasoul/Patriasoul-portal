/* PatriaSoul Portal Core — central content, related stories, metadata */
(() => {
  const registry = window.PatriaSoulContent && window.PatriaSoulContent.articles;
  if (!registry) return;
  const articles = Object.keys(registry).map(key => ({id:key, ...registry[key]}));
  const page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  const current = articles.find(a => a.url.toLowerCase() === page);

  const unique = arr => [...new Set(arr.filter(Boolean))];
  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const normalize = value => String(value || '').toLocaleLowerCase('hr-HR').normalize('NFD').replace(/[\u0300-\u036f]/g,'');

  const getTags = a => unique([a.category,a.subcategory,a.rubric,a.place,a.period,...(a.tags || [])]);
  const byDate = [...articles].sort((a,b) => (b.date || '').localeCompare(a.date || ''));

  window.PatriaSoulPortal = {
    articles,
    current,
    categories: unique(articles.map(a => a.category)),
    rubrics: unique(articles.map(a => a.rubric)),
    find(query='') {
      const q = normalize(query.trim());
      if (!q) return byDate;
      return articles.filter(a => normalize([a.title,a.deck,a.category,a.subcategory,a.rubric,a.place,a.period,a.type,...(a.tags||[])].join(' ')).includes(q));
    },
    related(article, limit=4) {
      if (!article) return [];
      const tags = new Set(getTags(article).map(normalize));
      return articles.filter(a => a.url !== article.url).map(a => {
        const score = getTags(a).reduce((n,t) => n + (tags.has(normalize(t)) ? 2 : 0), 0)
          + (a.category === article.category ? 3 : 0)
          + (a.subcategory === article.subcategory ? 2 : 0);
        return {a,score};
      }).sort((x,y) => y.score-x.score || (y.a.date||'').localeCompare(x.a.date||'')).slice(0,limit).map(x=>x.a);
    }
  };

  function renderRelated() {
    if (!current) return;
    const section = document.querySelector('.article-related');
    if (!section) return;
    const grid = section.querySelector('.article-related-grid') || section.appendChild(Object.assign(document.createElement('div'),{className:'article-related-grid'}));
    const related = window.PatriaSoulPortal.related(current,4);
    if (!related.length) return;
    grid.innerHTML = related.map(a => '<a class="article-related-card" href="'+esc(a.url)+'">'
      + '<img src="'+esc(a.image||'')+'" alt="'+esc(a.imageAlt||a.title)+'" loading="lazy" width="900" height="600">'
      + '<span><b>'+esc(a.rubric||a.category)+'</b><strong>'+esc(a.title)+'</strong><em>Pročitaj priču →</em></span></a>').join('');
  }

  function addArticleStructuredData() {
    if (!current || document.querySelector('script[data-patriasoul-article-schema]')) return;
    const body = document.querySelector('.article-body');
    const wordCount = body ? body.textContent.trim().split(/\s+/).filter(Boolean).length : 0;
    const data = {
      '@context':'https://schema.org',
      '@type':'Article',
      headline: current.title,
      description: current.deck,
      datePublished: current.date,
      dateModified: current.updated || current.date,
      author: {'@type':'Organization',name:'PatriaSoul'},
      publisher: {'@type':'Organization',name:'PatriaSoul'},
      mainEntityOfPage: location.href.split('#')[0],
      image: current.image ? [current.image] : [],
      articleSection: current.category,
      keywords: unique(current.tags || []).join(', '),
      wordCount
    };
    const script=document.createElement('script');
    script.type='application/ld+json';
    script.dataset.patriasoulArticleSchema='true';
    script.textContent=JSON.stringify(data);
    document.head.appendChild(script);
  }

  function addReadingMeta() {
    if (!current) return;
    const meta = document.querySelector('.article-meta');
    if (!meta || meta.dataset.coreMeta) return;
    meta.dataset.coreMeta='true';
    const extras = [];
    if (current.status) extras.push(current.status);
    if (current.updated && current.updated !== current.date) extras.push('Ažurirano '+current.updated.split('-').reverse().join('. '));
    if (current.sources) extras.push(current.sources+' izvora');
    if (extras.length) {
      const node=document.createElement('span');
      node.className='article-core-meta';
      node.textContent=extras.join(' · ');
      meta.appendChild(node);
    }
  }

  function injectSourceNotice() {
    if (!current) return;
    const body=document.querySelector('.article-body');
    if (!body || document.querySelector('.article-core-note')) return;
    const note=document.createElement('aside');
    note.className='article-core-note';
    note.innerHTML='<strong>UREDNIČKA NAPOMENA</strong><p>PatriaSoul razlikuje dokumentiranu činjenicu, tumačenje, svjedočanstvo i predaju. Ako je neki podatak osobno svjedočanstvo ili tradicija, to treba biti jasno označeno u tekstu. Izvore navodimo na kraju priče gdje god su dostupni.</p>';
    body.appendChild(note);
  }

  // Normalize article images without changing the existing markup.
  document.querySelectorAll('.article-page img, .article-body img').forEach((img,index) => {
    if (!img.hasAttribute('loading')) img.loading = index === 0 ? 'eager' : 'lazy';
    img.decoding = 'async';
    if (!img.width) img.width = 1200;
    if (!img.height) img.height = 800;
    img.setAttribute('width', String(img.width));
    img.setAttribute('height', String(img.height));
    if (!img.alt) img.alt = current ? current.title : 'PatriaSoul';
  });

  renderRelated();
  addArticleStructuredData();
  addReadingMeta();
  injectSourceNotice();
})();
