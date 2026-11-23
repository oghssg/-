const $ = selector => document.querySelector(selector);
const form = $('form');
const dialog = $('dialog');
const menu = $('.menu');
menu.onclick = () => menu.setAttribute('aria-expanded', String($('.top').classList.toggle('open')));
$('nav').onclick = () => { $('.top').classList.remove('open'); menu.setAttribute('aria-expanded','false'); };
$('[data-call]').onclick = () => dialog.showModal();
dialog.onclick = e => { if (e.target.closest('a,button')) dialog.close(); };
if (form) {
  const f = form.elements;
  let product = '';
  let token = crypto.randomUUID();
  const select = id => {
    product = ['Рицинолеат цинка','Адъюванты'][Number(id)-1] || (id ? 'Позиция каталога №'+id : '');
    $('#selected').textContent = product;
    $('#selected').hidden = !product;
  };
  select(new URLSearchParams(location.search).get('product'));
  document.addEventListener('click', e => {
    const a = e.target.closest('a');
    if (!a || !a.href.endsWith('#request')) return;
    e.preventDefault();
    select(a.dataset.product || '');
    f.sample.checked = a.hasAttribute('data-sample');
    $('#request').scrollIntoView();
    f.name.focus({preventScroll:true});
  });
  form.oninput = () => {
    token = crypto.randomUUID();
    const mail = f.channel.value === 'email';
    $('#emailbox').hidden = !mail;
    f.email.disabled = !mail;
    f.email.required = mail;
    f.phone.setCustomValidity('');
    $('#status').textContent = '';
  };
  form.oninput();
  form.onsubmit = async e => {
    e.preventDefault();
    if (!/^[+\d\s().-]+$/.test(f.phone.value) || !/^\d{7,15}$/.test(f.phone.value.replace(/\D/g,''))) {
      f.phone.setCustomValidity('Введите телефон с кодом страны.'); f.phone.reportValidity(); return;
    }
    const button = form.querySelector('[type=submit]');
    if(button.disabled) return;
    button.disabled = true;
    try {
      const res = await fetch('/api/request',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,name:f.name.value.trim(),phone:f.phone.value,channel:f.channel.value,email:f.email.disabled?'':f.email.value,sample:f.sample.checked,product})});
      if (!res.ok || !(await res.json()).accepted) throw Error();
      form.reset(); select(''); form.oninput(); $('#status').textContent='Спасибо, свяжемся в течение рабочего дня';
    } catch { $('#status').textContent='Не удалось отправить. Проверьте данные и попробуйте ещё раз.'; }
    finally { button.disabled=false; }
  };
}
if ($('#search')) {
  const update = () => {
    const word = $('#search').value.trim().toLocaleLowerCase('ru');
    let shown = 0;
    document.querySelectorAll('.product').forEach(card => {
      card.hidden = !card.querySelector('h3').textContent.toLowerCase().includes(word) || ($('#category').selectedIndex && card.dataset.group !== $('#category').value);
      if (!card.hidden) shown++;
    });
    $('#count').textContent = shown ? 'Найдено позиций: '+shown : 'Ничего не найдено. Измените поиск или категорию.';
  };
  $('#search').oninput=update; $('#category').onchange=update; update();
}
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer=new IntersectionObserver(entries=>entries.forEach(({target,isIntersecting})=>{if(isIntersecting){target.classList.add('reveal');observer.unobserve(target);}}));
  document.querySelectorAll('main section:not(.hero) h2,.steps li,.doc').forEach(el=>observer.observe(el));
}
