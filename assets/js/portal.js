(() => {
  const toggle=document.querySelector('.menu-toggle');
  const nav=document.querySelector('#main-nav');
  if(!toggle||!nav)return;
  toggle.addEventListener('click',()=>{
    const open=nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded',String(open));
    toggle.textContent=open?'Zatvori':'Izbornik';
  });
})();