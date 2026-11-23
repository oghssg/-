// Кнопки из каталога и с главной открывают одну форму.
const requestDialog = document.querySelector('#request');
const phoneDialog = document.querySelector('#call');
const form = document.querySelector('#quote');
const fields = form.elements;
const menu = document.querySelector('.menu');
const topBar = document.querySelector('.top');
const statusText = document.querySelector('#status');
const emailBox = document.querySelector('#email-box');
function syncChannel() {
  const enabled = fields.channel.value === 'email';
  emailBox.hidden = !enabled;
  fields.email.disabled = !enabled;
  fields.email.required = enabled;
}
function openRequest(trigger, legacyId) {
  if (phoneDialog.open) phoneDialog.close();
  const id = legacyId || trigger?.dataset.product;
  if (id) {
    const product = document.querySelector('[data-product="' + CSS.escape(id) + '"]')?.closest('.product');
    if (product) fields.product.value = product.classList.contains('placeholder') ? 'Позиция каталога №' + id : product.querySelector('h3').textContent;
  }
  if (trigger?.hasAttribute('data-sample')) fields.sample.checked = true;
  else if (id) fields.sample.checked = false;
  statusText.textContent = '';
  requestDialog.showModal();
  requestDialog.scrollTop = 0;
  requestDialog.querySelector('[data-close]').focus({preventScroll:true});
}
document.addEventListener('click', event => {
  const trigger = event.target.closest('[data-request]');
  if (trigger) openRequest(trigger);
  if (event.target.closest('[data-call]')) phoneDialog.showModal();
  if (event.target.closest('[data-close]')) event.target.closest('dialog').close();
  if (event.target instanceof HTMLDialogElement) {
    const bounds = event.target.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) event.target.close();
  }
});
menu.onclick = () => menu.setAttribute('aria-expanded', String(topBar.classList.toggle('open')));
document.querySelector('nav').onclick = () => {
  menu.setAttribute('aria-expanded','false');
  topBar.classList.remove('open');
};
form.oninput = () => {
  syncChannel();
  fields.phone.setCustomValidity('');
  fields.name.setCustomValidity('');
  statusText.textContent = '';
};
syncChannel();
// GitHub Pages обслуживает статические файлы. До подключения канала
// черновик сохраняется только по запросу пользователя, на его устройстве.
form.addEventListener('submit', event => {
  event.preventDefault();
  if (fields.website.value) return;
  if (!fields.name.value.trim()) {
    fields.name.setCustomValidity('Введите имя.');
    fields.name.reportValidity();
    return;
  }
  const phone = fields.phone.value.trim();
  if (!/^[+\d\s().-]+$/.test(phone) || !/^\d{7,15}$/.test(phone.replace(/\D/g,''))) {
    fields.phone.setCustomValidity('Введите телефон с кодом страны.');
    fields.phone.reportValidity();
    return;
  }
  const comment = fields.comment?.value.trim();
  const lines = ['Заявка в «Профпартнер»', fields.product.value && 'Сырьё: ' + fields.product.value,
    fields.amount.value && 'Количество: ' + fields.amount.value + ' ' + fields.unit.value,
    'Пробный образец: ' + (fields.sample.checked ? 'да' : 'нет'),
    'Имя: ' + fields.name.value.trim(), 'Телефон: ' + phone,
    'Ответить: ' + (fields.email.disabled ? 'в мессенджер' : fields.email.value),
    comment && 'Комментарий: ' + comment];
  const url = URL.createObjectURL(new Blob(['\uFEFF' + lines.filter(Boolean).join('\n')],{type:'text/plain;charset=utf-8'}));
  const link = document.createElement('a');
  link.href = url; link.download = 'Профпартнер-заявка.txt';
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60000);
  statusText.textContent = 'Черновик готов к скачиванию. Менеджеру он не отправлен.';
});
if (location.hash === '#request') openRequest(null,new URLSearchParams(location.search).get('product'));
const search = document.querySelector('#search');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
if (search) {
  const category = document.querySelector('#category');
  function filter(animate) {
    const word = search.value.trim().toLocaleLowerCase('ru');
    const cards = [...document.querySelectorAll('.product')];
    let count = 0;
    for (const card of cards) {
      card.hidden = !card.querySelector('h3').textContent.toLocaleLowerCase('ru').includes(word) || Boolean(category.selectedIndex && card.dataset.group !== category.value);
      if (!card.hidden) {
        count++;
        if (animate && !reduced.matches) card.animate([{opacity:.45},{opacity:1}],{duration:200});
      }
    }
    document.querySelector('#count').textContent = count ? 'Найдено позиций: ' + count : 'Ничего не найдено. Измените поиск или категорию.';
  }
  search.oninput = category.onchange = () => filter(true);
  filter(false);
}
if ('IntersectionObserver' in window && !reduced.matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(({target,isIntersecting}) => {
      if (!isIntersecting) return;
      target.classList.add(target.matches('.steps li') ? 'active' : 'entered');
      observer.unobserve(target);
    });
  },{threshold:.12});
  document.querySelectorAll('.four article,.steps li,.aud-grid article').forEach(el => {
    el.style.setProperty('--lag', [...el.parentElement.children].indexOf(el) * 65 + 'ms');
    observer.observe(el);
  });
}

if ('IntersectionObserver' in window && !reduced.matches) {
  const headings = new IntersectionObserver(entries => {
    for (const {target, isIntersecting} of entries) {
      if (!isIntersecting) continue;
      target.classList.add('section-heading-in');
      headings.unobserve(target);
    }
  }, {threshold:.2});
  document.querySelectorAll('main section h2, footer h2').forEach(heading => headings.observe(heading));
}
