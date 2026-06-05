/**
 * menu-online · ementa/app.js
 * Depende de: ../shared/data.js
 *
 * Lógica da ementa pública:
 *  - Nav scroll effect
 *  - Tabs de categorias
 *  - Renderização dos itens (cards ou lista)
 *  - Actualização em tempo real quando o backoffice altera dados
 *
 * ─────────────────────────────────────────────────────────────
 * PERSONALIZAÇÃO
 *  • Para usar layout de lista em vez de cards numa categoria
 *    (útil para bebidas/vinhos), adiciona o seu nome à
 *    constante LIST_CATS abaixo.
 * ─────────────────────────────────────────────────────────────
 */

'use strict';

/* Categorias que usam layout de lista em vez de cards */
const LIST_CATS = ['bebidas', 'vinhos'];

/* ── Nav: fundo sólido ao fazer scroll ──────────────────────── */
(function () {
  const nav = document.querySelector('.nav');
  if (!nav) return;
  const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ── Tabs ────────────────────────────────────────────────────── */
(function () {
  const btns   = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.cat-panel');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;

      btns.forEach(b => {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-selected', String(b === btn));
      });
      panels.forEach(p => p.classList.toggle('active', p.id === 'panel-' + cat));

      /* Scroll suave até à barra de tabs */
      const bar = document.querySelector('.tabs-bar');
      if (bar) {
        window.scrollTo({
          top: bar.getBoundingClientRect().top + window.scrollY - 4,
          behavior: 'smooth',
        });
      }
    });
  });
})();

/* ── Renderização ────────────────────────────────────────────── */

/** Card de item (com foto opcional) */
function renderCard(item) {
  const foto = item.foto
    ? `<div class="item-card__photo-wrap">
         <img class="item-card__photo"
              src="${clEscape(item.foto)}"
              alt="${clEscape(item.nome)}"
              loading="lazy">
       </div>`
    : `<div class="item-card__no-photo" aria-hidden="true">
         <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
           <rect x="3" y="3" width="18" height="18" rx="1"/>
           <circle cx="8.5" cy="8.5" r="1.5"/>
           <polyline points="21 15 16 10 5 21"/>
         </svg>
       </div>`;

  return `
    <article class="item-card">
      ${foto}
      <div class="item-card__body">
        <h3 class="item-card__name">${clEscape(item.nome)}</h3>
        ${item.descricao
          ? `<p class="item-card__desc">${clEscape(item.descricao)}</p>`
          : ''}
        <div class="item-card__footer">
          <span class="item-card__price">${clFormatPreco(item.preco)}</span>
          ${item.alergenios
            ? `<span class="item-card__allergens">${clEscape(item.alergenios)}</span>`
            : ''}
        </div>
      </div>
    </article>`;
}

/** Linha de lista (para bebidas / vinhos) */
function renderListItem(item) {
  return `
    <div class="wine-item">
      <div>
        <div class="wine-item__name">${clEscape(item.nome)}</div>
        ${item.descricao
          ? `<div class="wine-item__desc">${clEscape(item.descricao)}</div>`
          : ''}
      </div>
      <div class="wine-item__price">${clFormatPreco(item.preco)}</div>
    </div>`;
}

/** Bloco de subcategoria */
function renderSubcat(subcat, useList) {
  const items = subcat.items || [];

  const nota = subcat.nota
    ? `<p class="subcat__nota">${clEscape(subcat.nota)}</p>`
    : '';

  let itemsHtml;
  if (items.length === 0) {
    itemsHtml = `<div class="empty"><p>Sem itens nesta secção.</p></div>`;
  } else if (useList) {
    itemsHtml = `<div class="wine-list">${items.map(renderListItem).join('')}</div>`;
  } else {
    itemsHtml = `<div class="items-grid">${items.map(renderCard).join('')}</div>`;
  }

  return `
    <section class="subcat" id="subcat-${clEscape(subcat.id)}">
      <div class="subcat__header">
        <h2 class="subcat__title">${clEscape(subcat.nome)}</h2>
      </div>
      ${nota}
      ${itemsHtml}
    </section>`;
}

/** Renderiza todos os painéis */
function renderAll() {
  const data = clLoadData();

  document.querySelectorAll('.cat-panel').forEach(panel => {
    const cat = panel.id.replace('panel-', '');
    const catData = data[cat];

    if (!catData?.subcategorias?.length) {
      panel.querySelector('.cat-inner').innerHTML =
        '<div class="empty"><p>Categoria sem itens de momento.</p></div>';
      return;
    }

    const useList = LIST_CATS.includes(cat);
    panel.querySelector('.cat-inner').innerHTML =
      catData.subcategorias.map(sub => renderSubcat(sub, useList)).join('');
  });
}

/* ── Init ────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', renderAll);

/* Actualiza em tempo real se o backoffice estiver aberto noutra tab */
window.addEventListener('storage', e => {
  if (e.key === CL_STORAGE_KEY) renderAll();
});
