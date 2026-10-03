(() => {
  const SUPABASE_URL = 'https://ijimozjfdffejbczwyzb.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_SvuPtQUmXamt1a1_JpU6Jg_Bf3Fshqr';
  const QUIZ_URL = 'https://patriasoul.github.io/kviz/';
  const CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.58.0/dist/umd/supabase.min.js';
  const load = src => new Promise((resolve,reject)=>{const s=document.createElement('script');s.src=src;s.onload=resolve;s.onerror=reject;document.head.appendChild(s)});
  const esc = s => String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const slug = () => {
    const path=location.pathname.split('/').pop()||'index.html';
    return path.replace(/\.html$/,'');
  };
  let sb=null, user=null, profile=null, authMode='login';

  function avatar(p, size=''){const name=(p?.display_name||p?.email||'P').trim();const initials=name.split(/\s+/).slice(0,2).map(x=>x[0]).join('').toUpperCase();return '<span class="ps-avatar '+size+'">'+(p?.avatar_url?'<img src="'+esc(p.avatar_url)+'" alt="">':esc(initials||'P'))+'</span>'}

  async function ensureProfile(){
    if(!user) return;
    const {data}=await sb.from('profiles').select('id,display_name,avatar_url,role').eq('id',user.id).maybeSingle();
    profile=data||{id:user.id,display_name:user.user_metadata?.display_name||user.email?.split('@')[0]||'Korisnik',role:'player'};
    if(!data) await sb.from('profiles').upsert({id:user.id,display_name:profile.display_name},{onConflict:'id'});
  }

  function openAuth(mode='login'){
    authMode=mode;
    const box=document.createElement('div');box.className='ps-auth-modal';box.id='ps-auth-modal';
    box.innerHTML='<div class="ps-auth-card"><button class="ps-close" aria-label="Zatvori">×</button><h2>'+(mode==='login'?'Prijava':'Registracija')+'</h2><p class="ps-community-muted">Isti PatriaSoul račun koristi se i za kviz i za portal.</p><label>E-mail</label><input id="ps-email" type="email" autocomplete="email"><label>Lozinka</label><input id="ps-pass" type="password" autocomplete="'+(mode==='login'?'current-password':'new-password')+'"><div class="ps-auth-actions"><button id="ps-submit">'+(mode==='login'?'Prijavi se':'Registriraj se')+'</button><button id="ps-google">Nastavi s Googleom</button></div><div id="ps-auth-error" class="ps-auth-error"></div><div class="ps-auth-switch">'+(mode==='login'?'Nemaš račun? ':'Već imaš račun? ')+'<button id="ps-switch">'+(mode==='login'?'Registriraj se':'Prijavi se')+'</button></div></div>';
    document.body.appendChild(box);
    box.querySelector('.ps-close').onclick=()=>box.remove();
    box.onclick=e=>{if(e.target===box)box.remove()};
    box.querySelector('#ps-switch').onclick=()=>{box.remove();openAuth(mode==='login'?'signup':'login')};
    box.querySelector('#ps-submit').onclick=async()=>{
      const email=box.querySelector('#ps-email').value.trim(), password=box.querySelector('#ps-pass').value;
      const out=box.querySelector('#ps-auth-error');out.textContent='';
      let res=mode==='login'?await sb.auth.signInWithPassword({email,password}):await sb.auth.signUp({email,password,options:{data:{display_name:email.split('@')[0]}}});
      if(res.error){out.textContent=res.error.message;return}
      if(mode==='signup'&&!res.data.session){out.textContent='Registracija je zaprimljena. Provjeri e-mail i potvrdi račun.';return}
      box.remove();
    };
    box.querySelector('#ps-google').onclick=async()=>{const {error}=await sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.href}});if(error)box.querySelector('#ps-auth-error').textContent=error.message};
  }

  function authHeader(){
    const utility=document.querySelector('.utility-inner'); if(!utility)return;
    const old=document.getElementById('ps-auth-area'); if(old)old.remove();
    const area=document.createElement('div');area.id='ps-auth-area';area.className='ps-authbar';
    if(!user){area.innerHTML='<button id="ps-login">Prijava</button><button id="ps-signup">Registracija</button>';}
    else{
      area.innerHTML='<button class="ps-user" id="ps-profile">'+avatar(profile)+'<span>'+esc(profile?.display_name||user.email||'Profil')+'</span></button><button id="ps-notify" class="ps-tool">🔔</button><button id="ps-logout" class="ps-tool">Odjava</button>';
    }
    utility.appendChild(area);
    if(!user){area.querySelector('#ps-login').onclick=()=>openAuth('login');area.querySelector('#ps-signup').onclick=()=>openAuth('signup')}
    else{area.querySelector('#ps-profile').onclick=showProfile;area.querySelector('#ps-logout').onclick=()=>sb.auth.signOut();area.querySelector('#ps-notify').onclick=showNotifications;loadNotifications()}
  }

  async function showProfile(){
    const modal=document.createElement('div');modal.className='ps-auth-modal';modal.innerHTML='<div class="ps-auth-card"><button class="ps-close">×</button><h2>Moj PatriaSoul profil</h2><div class="ps-profile-card">'+avatar(profile,'ps-profile-avatar')+'<div><strong>'+esc(profile?.display_name||'Korisnik')+'</strong><p class="ps-community-muted">'+esc(user.email||'')+'</p></div></div><label>Ime za prikaz</label><input id="ps-display" maxlength="24" value="'+esc(profile?.display_name||'')+'"><label>Profilna slika</label><input id="ps-avatar-file" type="file" accept="image/png,image/jpeg,image/webp"><div class="ps-auth-actions"><button id="ps-save">Spremi profil</button></div><div id="ps-profile-msg" class="ps-auth-error"></div></div>';
    document.body.appendChild(modal);modal.querySelector('.ps-close').onclick=()=>modal.remove();modal.onclick=e=>{if(e.target===modal)modal.remove()};
    modal.querySelector('#ps-save').onclick=async()=>{
      const msg=modal.querySelector('#ps-profile-msg');msg.textContent='';
      const name=modal.querySelector('#ps-display').value.trim(); let avatarUrl=profile.avatar_url||null;
      const file=modal.querySelector('#ps-avatar-file').files[0];
      if(name.length<3||name.length>24){msg.textContent='Ime za prikaz mora imati 3–24 znaka.';return}
      if(file){if(file.size>2*1024*1024){msg.textContent='Slika može imati najviše 2 MB.';return}const ext=(file.name.split('.').pop()||'jpg').toLowerCase();const path=user.id+'/'+crypto.randomUUID()+'.'+ext;const up=await sb.storage.from('avatars').upload(path,file,{upsert:false,contentType:file.type});if(up.error){msg.textContent=up.error.message;return}avatarUrl=sb.storage.from('avatars').getPublicUrl(path).data.publicUrl}
      const up=await sb.from('profiles').update({display_name:name,avatar_url:avatarUrl,updated_at:new Date().toISOString()}).eq('id',user.id);if(up.error){msg.textContent=up.error.message;return}
      await ensureProfile();modal.remove();authHeader();
    };
  }

  async function showNotifications(){
    let panel=document.querySelector('.ps-notification-panel');if(panel){panel.remove();return}
    const btn=document.querySelector('#ps-notify');panel=document.createElement('div');panel.className='ps-notification-panel';panel.innerHTML='<strong>Obavijesti</strong><div class="ps-community-muted">Učitavanje…</div>';btn.parentElement.appendChild(panel);
    const {data}=await sb.from('community_notifications').select('id,type,comment_id,read_at,created_at,actor_id').eq('user_id',user.id).order('created_at',{ascending:false}).limit(20);
    if(!data?.length){panel.innerHTML='<strong>Obavijesti</strong><p class="ps-community-muted">Nema novih obavijesti.</p>';return}
    const actors=[...new Set(data.map(x=>x.actor_id))];let names={};if(actors.length){const q=await sb.from('profiles').select('id,display_name').in('id',actors);(q.data||[]).forEach(x=>names[x.id]=x.display_name)}
    panel.innerHTML='<strong>Obavijesti</strong>'+data.map(n=>'<div class="ps-notification '+(!n.read_at?'ps-unread':'')+'">👤 <b>'+esc(names[n.actor_id]||'Korisnik')+'</b> je odgovorio na tvoj komentar.<br><small>'+new Date(n.created_at).toLocaleString('hr-HR')+'</small></div>').join('');
    const unread=data.filter(n=>!n.read_at).map(n=>n.id);if(unread.length)await sb.from('community_notifications').update({read_at:new Date().toISOString()}).in('id',unread);
  }

  async function loadNotifications(){if(!user)return; await sb.from('community_notifications').select('id').eq('user_id',user.id).is('read_at',null).limit(1)}

  function commentHtml(c,counts,myReactions){
    const name=counts.profiles?.[c.user_id]||'Korisnik';const r=myReactions[c.id];const like=counts.reactions?.[c.id]?.like||0,dis=counts.reactions?.[c.id]?.dislike||0;
    return '<div class="ps-comment" data-comment="'+c.id+'"><div class="ps-comment-head">'+avatar({display_name:name,avatar_url:counts.avatars?.[c.user_id]})+'<div><div class="ps-comment-name">'+esc(name)+'</div><div class="ps-comment-date">'+new Date(c.created_at).toLocaleString('hr-HR')+'</div></div></div><div class="ps-comment-body">'+esc(c.content)+'</div><div class="ps-comment-tools"><button class="ps-tool '+(r==='like'?'active':'')+'" data-react="like">❤️ '+like+'</button><button class="ps-tool '+(r==='dislike'?'active':'')+'" data-react="dislike">👎 '+dis+'</button><button class="ps-tool" data-reply>↩ Odgovori</button><button class="ps-tool" data-report>⚑ Prijavi</button></div><div class="ps-replies"></div></div>';
  }

  async function mountComments(){
    const article=document.querySelector('.article-page');if(!article)return;
    const old=document.getElementById('ps-community');if(old)old.remove();
    const root=document.createElement('section');root.id='ps-community';root.className='ps-community';root.innerHTML='<h2>💬 Komentari</h2><p class="ps-community-muted">Rasprava je otvorena registriranim korisnicima. Molimo poštujte druge i držite se teme članka.</p>';
    article.appendChild(root);
    const toolbar=document.createElement('div');toolbar.className='ps-share-row';toolbar.innerHTML='<button data-share>↗ Podijeli članak</button><button data-article-like>❤️ Sviđa mi se <span>0</span></button><button data-article-dislike>👎 Ne sviđa mi se <span>0</span></button>';root.appendChild(toolbar);
    toolbar.querySelector('[data-share]').onclick=async()=>{const data={title:document.title,text:document.querySelector('.article-deck')?.textContent||'',url:location.href};if(navigator.share)await navigator.share(data).catch(()=>{});else{await navigator.clipboard.writeText(location.href);alert('Poveznica je kopirana.')}await sb.from('community_article_shares').insert({article_slug:slug(),user_id:user?.id||null,channel:navigator.share?'native':'copy'})};
    const ar=await sb.from('community_article_reactions').select('user_id,reaction').eq('article_slug',slug());const ac={like:0,dislike:0};(ar.data||[]).forEach(x=>ac[x.reaction]++);toolbar.querySelector('[data-article-like] span').textContent=ac.like;toolbar.querySelector('[data-article-dislike] span').textContent=ac.dislike;
    const mine=(ar.data||[]).find(x=>x.user_id===user?.id);toolbar.querySelector('[data-article-like]').classList.toggle('active',mine?.reaction==='like');toolbar.querySelector('[data-article-dislike]').classList.toggle('active',mine?.reaction==='dislike');
    async function articleReact(type){if(!user){openAuth('login');return}if(mine?.reaction===type){await sb.from('community_article_reactions').delete().eq('article_slug',slug()).eq('user_id',user.id)}else{await sb.from('community_article_reactions').upsert({article_slug:slug(),user_id:user.id,reaction:type},{onConflict:'article_slug,user_id'})}mountComments()}
    toolbar.querySelector('[data-article-like]').onclick=()=>articleReact('like');toolbar.querySelector('[data-article-dislike]').onclick=()=>articleReact('dislike');

    if(!user){root.insertAdjacentHTML('beforeend','<div class="ps-login-prompt">Za pisanje komentara, reakcije i prijavu komentara <button id="ps-community-login">prijavi se</button> ili se <button id="ps-community-signup">registriraj</button>.</div>');root.querySelector('#ps-community-login').onclick=()=>openAuth('login');root.querySelector('#ps-community-signup').onclick=()=>openAuth('signup')}
    else{root.insertAdjacentHTML('beforeend','<div class="ps-comment-form"><textarea id="ps-comment-text" maxlength="1000" placeholder="Napiši komentar…"></textarea><div class="ps-comment-actions"><span class="ps-count">0 / 1000</span><button id="ps-post">Objavi komentar</button></div></div>');const ta=root.querySelector('textarea');ta.oninput=()=>root.querySelector('.ps-count').textContent=ta.value.length+' / 1000';root.querySelector('#ps-post').onclick=async()=>{const content=ta.value.trim();if(!content)return;const res=await sb.from('community_comments').insert({user_id:user.id,article_slug:slug(),content});if(res.error)alert(res.error.message);else{ta.value='';mountComments()}}}

    const q=await sb.from('community_comments').select('id,user_id,parent_id,content,created_at,updated_at').eq('article_slug',slug()).eq('status','published').order('created_at',{ascending:true});
    const comments=q.data||[];if(q.error){root.insertAdjacentHTML('beforeend','<div class="ps-notice">'+esc(q.error.message)+'</div>');return}
    const ids=comments.map(c=>c.id), users=[...new Set(comments.map(c=>c.user_id))];let profs=[],reacts=[];
    if(users.length){const p=await sb.from('profiles').select('id,display_name,avatar_url').in('id',users);profs=p.data||[]}
    if(ids.length){const rr=await sb.from('community_comment_reactions').select('comment_id,user_id,reaction').in('comment_id',ids);reacts=rr.data||[]}
    const names={};const avatars={};profs.forEach(p=>{names[p.id]=p.display_name||'Korisnik';avatars[p.id]=p.avatar_url});const reactions={};const mine={};reacts.forEach(r=>{reactions[r.comment_id]??={like:0,dislike:0};reactions[r.comment_id][r.reaction]++;if(r.user_id===user?.id)mine[r.comment_id]=r.reaction});
    const counts={profiles:names,avatars,reactions};const map={};comments.forEach(c=>map[c.id]=c);
    const top=comments.filter(c=>!c.parent_id);const list=document.createElement('div');list.className='ps-comments-list';list.innerHTML=top.map(c=>commentHtml(c,counts,mine)).join('');root.appendChild(list);
    comments.filter(c=>c.parent_id).forEach(c=>{const parent=list.querySelector('[data-comment="'+c.parent_id+'"] .ps-replies');if(parent)parent.insertAdjacentHTML('beforeend',commentHtml(c,counts,mine))});
    list.querySelectorAll('[data-comment]').forEach(el=>bindComment(el,root,counts,mine));
  }

  async function bindComment(el,root,counts,mine){
    const id=el.dataset.comment;
    el.querySelectorAll('[data-react]').forEach(btn=>btn.onclick=async()=>{if(!user){openAuth('login');return}const type=btn.dataset.react;if(mine[id]===type)await sb.from('community_comment_reactions').delete().eq('comment_id',id).eq('user_id',user.id);else await sb.from('community_comment_reactions').upsert({comment_id:id,user_id:user.id,reaction:type},{onConflict:'comment_id,user_id'});mountComments()});
    el.querySelector('[data-reply]').onclick=()=>{if(!user){openAuth('login');return}const existing=el.querySelector('.ps-inline-reply');if(existing){existing.remove();return}const box=document.createElement('div');box.className='ps-inline-reply ps-comment-form';box.innerHTML='<textarea maxlength="1000" placeholder="Odgovori…"></textarea><button>Objavi odgovor</button>';el.appendChild(box);box.querySelector('button').onclick=async()=>{const content=box.querySelector('textarea').value.trim();if(!content)return;const res=await sb.from('community_comments').insert({user_id:user.id,article_slug:slug(),parent_id:id,content});if(res.error)alert(res.error.message);else mountComments()}};
    el.querySelector('[data-report]').onclick=()=>{if(!user){openAuth('login');return}const box=document.createElement('div');box.className='ps-report-box';box.innerHTML='<select><option value="spam">Spam</option><option value="uvreda">Uvreda</option><option value="mrznja">Govor mržnje</option><option value="neprimjeren_sadrzaj">Neprimjeren sadržaj</option><option value="dezinformacija">Moguća dezinformacija</option><option value="drugo">Drugo</option></select><button>Pošalji prijavu</button>';el.appendChild(box);box.querySelector('button').onclick=async()=>{const reason=box.querySelector('select').value;const r=await sb.from('community_comment_reports').insert({comment_id:id,reporter_id:user.id,reason});box.remove();if(r.error)alert(r.error.message);else alert('Hvala. Prijava je poslana na moderiranje.')}};
  }

  async function init(){
    if(!window.supabase){try{await load(CDN)}catch(e){return}}
    sb=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true,storageKey:'patriasoul-auth'}});
    const session=(await sb.auth.getSession()).data.session;user=session?.user||null;if(user)await ensureProfile();
    sb.auth.onAuthStateChange(async(_event,s)=>{user=s?.user||null;if(user)await ensureProfile();authHeader();mountComments()});
    authHeader();mountComments();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();