/**
 * menu-online · backoffice/app.js
 * Depende de: ../shared/data.js  ./upload.js
 *
 * ─────────────────────────────────────────────────────────────
 * PERSONALIZAÇÃO
 *  • CL_AUTH_USER / CL_AUTH_PASS — credenciais de acesso.
 *    Substituir por autenticação server-side em produção.
 *  • CAT_LABELS — nomes das categorias para exibição.
 *    Têm de corresponder às chaves em CL_DEFAULT_DATA.
 *  • CAT_SUBS — descrição de cada categoria na interface.
 * ─────────────────────────────────────────────────────────────
 */

'use strict';

/* ── Credenciais (apenas para desenvolvimento local) ──────── */
const CL_AUTH_USER   = 'admin';
const CL_AUTH_PASS   = 'admin';
const CL_SESSION_KEY = 'menu_online_bo_auth';

/* ── Labels das categorias ────────────────────────────────── */
const CAT_LABELS = {
  entradas:   'Entradas',
  pratos:     'Pratos',
  sobremesas: 'Sobremesas',
  bebidas:    'Bebidas',
};

const CAT_SUBS = {
  entradas:   'Gerir as entradas',
  pratos:     'Gerir os pratos principais',
  sobremesas: 'Gerir as sobremesas',
  bebidas:    'Gerir as bebidas',
};

/* ── State ────────────────────────────────────────────────── */
const state = {
  cat:          Object.keys(CAT_LABELS)[0],
  subcat:       null,
  editId:       null,
  deleteTarget: null,
  pendingFile:  null,
  removeFoto:   false,
  fotoActual:   '',
};

/* ── DOM helpers ──────────────────────────────────────────── */
const $ = id => document.getElementById(id);

/* ════════════════════════════════════════════════════════════
   AUTH
   ════════════════════════════════════════════════════════════ */
function doLogin() {
  const u = $('login-user').value.trim();
  const p = $('login-pass').value;

  if (u === CL_AUTH_USER && p === CL_AUTH_PASS) {
    sessionStorage.setItem(CL_SESSION_KEY, '1');
    $('login-screen').style.display = 'none';
    $('app').classList.add('visible');
    $('app').setAttribute('aria-hidden', 'false');
    $('login-error').textContent = '';
    initApp();
  } else {
    $('login-error').textContent = 'Credenciais inválidas. Tente novamente.';
    $('login-pass').value = '';
    $('login-pass').focus();
  }
}

function doLogout() {
  sessionStorage.removeItem(CL_SESSION_KEY);
  $('app').classList.remove('visible');
  $('login-screen').style.display = 'flex';
  $('login-user').value = '';
  $('login-pass').value = '';
  $('login-error').textContent = '';
}

/* ════════════════════════════════════════════════════════════
   INIT
   ════════════════════════════════════════════════════════════ */
function initApp() {
  if (!localStorage.getItem(CL_STORAGE_KEY)) {
    clSaveData(JSON.parse(JSON.stringify(CL_DEFAULT_DATA)));
  }
  renderSidebar();
  renderContent();
}

/* ════════════════════════════════════════════════════════════
   SIDEBAR
   ════════════════════════════════════════════════════════════ */
function renderSidebar() {
  const data    = clLoadData();
  const sidebar = $('sidebar-nav');
  sidebar.innerHTML = '';

  Object.keys(CAT_LABELS).forEach(cat => {
    const catData = data[cat];
    const total   = (catData?.subcategorias || [])
      .reduce((n, s) => n + (s.items?.length || 0), 0);
    const isActive = state.cat === cat;

    const btn = document.createElement('button');
    btn.className = 'sidebar__btn' + (isActive ? ' active' : '');
    btn.setAttribute('aria-pressed', String(isActive));
    btn.innerHTML = `${clEscape(CAT_LABELS[cat])} <span class="sidebar__count">${total}</span>`;
    btn.addEventListener('click', () => {
      state.cat = cat;
      state.subcat = null;
      renderSidebar();
      renderContent();
    });
    sidebar.appendChild(btn);

    if (isActive && catData?.subcategorias?.length) {
      catData.subcategorias.forEach(sub => {
        const sBtn = document.createElement('button');
        sBtn.className = 'sidebar__btn-sub' + (state.subcat === sub.id ? ' active' : '');
        sBtn.innerHTML = `${clEscape(sub.nome)} <span class="sidebar__count">${sub.items?.length || 0}</span>`;
        sBtn.addEventListener('click', () => {
          state.subcat = state.subcat === sub.id ? null : sub.id;
          renderSidebar();
          renderContent();
        });
        sidebar.appendChild(sBtn);
      });
    }
  });
}

/* ════════════════════════════════════════════════════════════
   CONTENT
   ════════════════════════════════════════════════════════════ */
function renderContent() {
  const data    = clLoadData();
  const catData = data[state.cat];

  let title = CAT_LABELS[state.cat] || state.cat;
  if (state.subcat) {
    const sub = (catData?.subcategorias || []).find(s => s.id === state.subcat);
    if (sub) title += ' · ' + sub.nome;
  }
  $('content-title').textContent = title;
  $('content-sub').textContent   = CAT_SUBS[state.cat] || '';

  const subcats = (catData?.subcategorias || [])
    .filter(s => !state.subcat || s.id === state.subcat);

  const container = $('items-container');

  if (!subcats.length) {
    container.innerHTML = '<p class="empty-msg">Sem itens. Adicione o primeiro!</p>';
    return;
  }

  let html = '';
  subcats.forEach(sub => {
    const items = sub.items || [];

    html += `<div style="margin-bottom:2.4rem">
      <div style="display:flex;align-items:center;
                  margin-bottom:1rem;padding-bottom:0.6rem;
                  border-bottom:1px solid var(--accent-border)">
        <span style="font-family:var(--font-serif);font-size:1.1rem;
                     font-weight:300;letter-spacing:0.04em;color:var(--text)">
          ${clEscape(sub.nome)}
        </span>
      </div>`;

    if (!items.length) {
      html += `<p class="empty-msg" style="padding:2rem 0">Subcategoria vazia.</p>`;
    } else {
      html += `<div class="tbl-wrap">
        <table class="tbl">
          <thead><tr>
            <th class="tbl__drag-cell"></th>
            <th class="tbl__thumb-cell">Foto</th>
            <th>Nome</th>
            <th class="tbl__desc">Descrição</th>
            <th>Preço</th>
            <th></th>
          </tr></thead>
          <tbody data-cat="${clEscape(state.cat)}" data-subcat="${clEscape(sub.id)}">`;

      items.forEach(item => {
        const thumb = item.foto
          ? `<img class="tbl__thumb" src="${clEscape(item.foto)}" alt="${clEscape(item.nome)}" loading="lazy">`
          : `<div class="tbl__no-thumb" aria-hidden="true">
               <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.2">
                 <rect x="3" y="3" width="18" height="18" rx="1"/>
                 <circle cx="8.5" cy="8.5" r="1.5"/>
                 <polyline points="21 15 16 10 5 21"/>
               </svg>
             </div>`;

        html += `<tr draggable="true" data-id="${item.id}">
          <td class="tbl__drag-cell" title="Arrastar para reordenar">
            <span class="drag-handle" aria-hidden="true">⠿</span>
          </td>
          <td class="tbl__thumb-cell">${thumb}</td>
          <td>
            <span class="tbl__name">${clEscape(item.nome)}</span>
            ${item.alergenios
              ? `<br><span style="font-size:0.62rem;color:var(--text-muted2)">${clEscape(item.alergenios)}</span>`
              : ''}
          </td>
          <td class="tbl__desc">${clEscape(item.descricao || '')}</td>
          <td><span class="tbl__price">${clFormatPreco(item.preco)}</span></td>
          <td class="tbl__actions">
            <button class="btn btn--ghost btn--icon js-edit"
                    data-cat="${clEscape(state.cat)}"
                    data-subcat="${clEscape(sub.id)}"
                    data-id="${item.id}">Editar</button>
            <button class="btn btn--danger-ghost btn--icon js-del"
                    style="margin-left:0.4rem"
                    data-cat="${clEscape(state.cat)}"
                    data-subcat="${clEscape(sub.id)}"
                    data-id="${item.id}">Eliminar</button>
          </td>
        </tr>`;
      });

      html += `</tbody></table></div>`;
    }
    html += `</div>`;
  });

  container.innerHTML = html;

  container.querySelectorAll('.js-edit').forEach(b => {
    b.addEventListener('click', () =>
      openModal(b.dataset.cat, b.dataset.subcat, parseInt(b.dataset.id, 10))
    );
  });
  container.querySelectorAll('.js-del').forEach(b => {
    b.addEventListener('click', () =>
      openConfirm(b.dataset.cat, b.dataset.subcat, parseInt(b.dataset.id, 10))
    );
  });

  container.querySelectorAll('tbody[data-subcat]').forEach(initDragDrop);
}

/* ════════════════════════════════════════════════════════════
   MODAL
   ════════════════════════════════════════════════════════════ */
function buildSubcatOptions(cat, selectedId) {
  const data    = clLoadData();
  const subcats = data[cat]?.subcategorias || [];
  return subcats.map(s =>
    `<option value="${clEscape(s.id)}" ${s.id === selectedId ? 'selected' : ''}>${clEscape(s.nome)}</option>`
  ).join('');
}

function openModal(cat, subcatId, itemId) {
  state.editId      = itemId || null;
  state.pendingFile = null;
  state.removeFoto  = false;
  state.fotoActual  = '';

  const data = clLoadData();
  let item   = null;
  if (itemId) {
    const sub = (data[cat]?.subcategorias || []).find(s => s.id === subcatId);
    item = (sub?.items || []).find(i => i.id === itemId) || null;
  }

  $('modal-title').textContent = item ? 'Editar Item' : 'Novo Item';
  $('f-nome').value       = item?.nome        || '';
  $('f-desc').value       = item?.descricao   || '';
  $('f-preco').value      = item?.preco       || '';
  $('f-alergenios').value = item?.alergenios  || '';
  $('f-subcat').innerHTML = buildSubcatOptions(state.cat, subcatId || null);

  state.fotoActual = item?.foto || '';
  const preview   = $('photo-preview');
  const hint      = $('photo-hint');
  const removeBtn = $('btn-remove-photo');

  if (state.fotoActual) {
    preview.src = state.fotoActual;
    preview.style.display   = 'block';
    hint.style.display      = 'none';
    removeBtn.style.display = 'inline-block';
  } else {
    preview.src = '';
    preview.style.display   = 'none';
    hint.style.display      = 'block';
    removeBtn.style.display = 'none';
  }

  $('f-foto').value = '';
  $('modal-overlay').classList.add('open');
  setTimeout(() => $('f-nome').focus(), 80);
}

function closeModal() {
  $('modal-overlay').classList.remove('open');
  state.editId      = null;
  state.pendingFile = null;
  state.removeFoto  = false;
  state.fotoActual  = '';
}

async function saveItem() {
  const nome  = $('f-nome').value.trim();
  const preco = $('f-preco').value.trim();

  if (!nome)  { showToast('O nome é obrigatório.', true); $('f-nome').focus(); return; }
  if (!preco) { showToast('O preço é obrigatório.', true); $('f-preco').focus(); return; }
  if (isNaN(parseFloat(preco))) { showToast('Preço inválido.', true); $('f-preco').focus(); return; }

  const data     = clLoadData();
  const subcatId = $('f-subcat').value;
  const sub      = (data[state.cat]?.subcategorias || []).find(s => s.id === subcatId);
  if (!sub) { showToast('Subcategoria inválida.', true); return; }

  /* ── Foto ── */
  let foto = state.fotoActual;

  if (state.removeFoto) {
    await clDeleteFoto(state.fotoActual).catch(() => {});
    foto = '';
  } else if (state.pendingFile) {
    const btn = $('modal-save');
    btn.disabled = true; btn.textContent = 'A guardar…';
    try {
      if (state.fotoActual) await clDeleteFoto(state.fotoActual).catch(() => {});
      foto = await clUploadFoto(state.pendingFile, state.cat);
    } catch (e) {
      console.warn('[menu-online] Upload falhou:', e.message);
      foto = state.fotoActual;
      showToast('Foto não enviada (servidor indisponível). Item guardado sem foto.', true);
    }
    btn.disabled = false; btn.textContent = 'Guardar';
  }

  /* ── Persistência ── */
  const itemData = {
    nome,
    descricao:  $('f-desc').value.trim(),
    preco,
    alergenios: $('f-alergenios').value.trim(),
    foto,
  };

  if (state.editId) {
    let foundSub = null, foundIdx = -1;
    data[state.cat].subcategorias.forEach(s => {
      const idx = (s.items || []).findIndex(i => i.id === state.editId);
      if (idx !== -1) { foundSub = s; foundIdx = idx; }
    });

    if (foundSub && foundSub.id === subcatId) {
      foundSub.items[foundIdx] = { id: state.editId, ...itemData };
    } else {
      if (foundSub) foundSub.items.splice(foundIdx, 1);
      sub.items = sub.items || [];
      sub.items.push({ id: state.editId, ...itemData });
    }
    showToast('Item actualizado.');
  } else {
    sub.items = sub.items || [];
    sub.items.push({ id: clNextId(data), ...itemData });
    showToast('Item adicionado.');
  }

  clSaveData(data);
  closeModal();
  renderSidebar();
  renderContent();
}

/* ════════════════════════════════════════════════════════════
   DRAG-AND-DROP
   ════════════════════════════════════════════════════════════ */
function initDragDrop(tbody) {
  const cat      = tbody.dataset.cat;
  const subcatId = tbody.dataset.subcat;
  let dragRow    = null;
  let placeholder = null;

  function makePlaceholder() {
    const ph = document.createElement('tr');
    ph.className = 'drag-placeholder';
    ph.innerHTML = '<td colspan="6"></td>';
    return ph;
  }

  tbody.addEventListener('dragstart', e => {
    const row = e.target.closest('tr[draggable]');
    if (!row) return;
    dragRow = row;
    dragRow.classList.add('dragging');
    placeholder = makePlaceholder();
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', row.dataset.id);
    setTimeout(() => { if (dragRow) dragRow.style.opacity = '0.4'; }, 0);
  });

  tbody.addEventListener('dragend', () => {
    if (!dragRow) return;
    dragRow.classList.remove('dragging');
    dragRow.style.opacity = '';
    placeholder?.parentNode?.removeChild(placeholder);
    dragRow = null; placeholder = null;
  });

  tbody.addEventListener('dragover', e => {
    e.preventDefault();
    if (!dragRow) return;
    e.dataTransfer.dropEffect = 'move';
    const target = e.target.closest('tr[draggable]');
    if (!target || target === dragRow) return;
    const mid = target.getBoundingClientRect().top + target.getBoundingClientRect().height / 2;
    placeholder?.parentNode?.removeChild(placeholder);
    if (e.clientY < mid) tbody.insertBefore(placeholder, target);
    else target.after(placeholder);
  });

  tbody.addEventListener('drop', e => {
    e.preventDefault();
    if (!dragRow || !placeholder?.parentNode) return;
    tbody.insertBefore(dragRow, placeholder);
    placeholder.remove();
    persistOrder(tbody, cat, subcatId);
  });

  /* Touch */
  let touchRow = null, touchClone = null, touchOffY = 0;

  tbody.addEventListener('touchstart', e => {
    if (!e.target.closest('.drag-handle')) return;
    const row = e.target.closest('tr[draggable]');
    if (!row) return;
    touchRow = row;
    const rect = row.getBoundingClientRect();
    touchOffY  = e.touches[0].clientY - rect.top;
    touchClone = row.cloneNode(true);
    Object.assign(touchClone.style, {
      position: 'fixed', left: rect.left + 'px', top: rect.top + 'px',
      width: rect.width + 'px', opacity: '0.85', zIndex: '9999',
      pointerEvents: 'none', background: 'var(--bg-hover)',
      boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    });
    document.body.appendChild(touchClone);
    row.style.opacity = '0.3';
  }, { passive: true });

  tbody.addEventListener('touchmove', e => {
    if (!touchRow || !touchClone) return;
    e.preventDefault();
    const touch = e.touches[0];
    touchClone.style.top = (touch.clientY - touchOffY) + 'px';
    touchClone.style.display = 'none';
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    touchClone.style.display = '';
    const target = el?.closest('tr[draggable]');
    if (!target || target === touchRow) return;
    const mid = target.getBoundingClientRect().top + target.getBoundingClientRect().height / 2;
    if (touch.clientY < mid) tbody.insertBefore(touchRow, target);
    else target.after(touchRow);
  }, { passive: false });

  tbody.addEventListener('touchend', () => {
    if (!touchRow) return;
    touchRow.style.opacity = '';
    touchClone?.remove();
    touchClone = null;
    persistOrder(tbody, cat, subcatId);
    touchRow = null;
    renderSidebar();
  });
}

function persistOrder(tbody, cat, subcatId) {
  const newOrder = [...tbody.querySelectorAll('tr[draggable]')]
    .map(r => parseInt(r.dataset.id, 10));
  const data = clLoadData();
  const sub  = (data[cat]?.subcategorias || []).find(s => s.id === subcatId);
  if (sub) {
    sub.items = newOrder.map(id => sub.items.find(i => i.id === id)).filter(Boolean);
    clSaveData(data);
  }
  renderSidebar();
}

/* ════════════════════════════════════════════════════════════
   CONFIRM DELETE
   ════════════════════════════════════════════════════════════ */
function openConfirm(cat, subcatId, itemId) {
  state.deleteTarget = { cat, subcatId, itemId };
  $('confirm-overlay').classList.add('open');
}

function closeConfirm() {
  state.deleteTarget = null;
  $('confirm-overlay').classList.remove('open');
}

/* ════════════════════════════════════════════════════════════
   TOAST
   ════════════════════════════════════════════════════════════ */
let _toastTimer = null;

function showToast(msg, isError = false) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.toggle('error', isError);
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 3200);
}

/* ════════════════════════════════════════════════════════════
   BOOT — ligação de eventos
   ════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {

  /* Auth */
  $('btn-login').addEventListener('click', doLogin);
  $('login-pass').addEventListener('keydown', e => { if (e.key === 'Enter') doLogin(); });
  $('login-user').addEventListener('keydown', e => { if (e.key === 'Enter') $('login-pass').focus(); });
  $('btn-logout').addEventListener('click', doLogout);

  /* Adicionar */
  $('btn-add').addEventListener('click', () => {
    const data    = clLoadData();
    const subcats = data[state.cat]?.subcategorias || [];
    const defSub  = state.subcat || (subcats[0]?.id ?? null);
    openModal(state.cat, defSub, null);
  });

  /* Modal */
  $('modal-close').addEventListener('click',  closeModal);
  $('modal-cancel').addEventListener('click', closeModal);
  $('modal-save').addEventListener('click',   saveItem);
  $('modal-overlay').addEventListener('click', e => {
    if (e.target === $('modal-overlay')) closeModal();
  });

  /* Foto: escolher */
  $('f-foto').addEventListener('change', function () {
    const file = this.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('Ficheiro inválido. Escolha uma imagem.', true);
      this.value = ''; return;
    }
    if (file.size > 4 * 1024 * 1024) {
      showToast('Imagem demasiado grande (máx. 4 MB).', true);
      this.value = ''; return;
    }
    state.pendingFile = file;
    state.removeFoto  = false;
    const url = URL.createObjectURL(file);
    const prev = $('photo-preview');
    prev.src = url; prev.style.display = 'block';
    prev.onload = () => URL.revokeObjectURL(url);
    $('photo-hint').style.display       = 'none';
    $('btn-remove-photo').style.display = 'inline-block';
  });

  /* Foto: remover */
  $('btn-remove-photo').addEventListener('click', () => {
    state.pendingFile = null; state.removeFoto = true;
    $('photo-preview').src = ''; $('photo-preview').style.display = 'none';
    $('photo-hint').style.display       = 'block';
    $('btn-remove-photo').style.display = 'none';
    $('f-foto').value = '';
  });

  /* ESC */
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    if ($('confirm-overlay').classList.contains('open')) closeConfirm();
    else if ($('modal-overlay').classList.contains('open')) closeModal();
  });

  /* Confirm delete */
  $('confirm-cancel').addEventListener('click', closeConfirm);
  $('confirm-del').addEventListener('click', () => {
    if (!state.deleteTarget) return;
    const { cat, subcatId, itemId } = state.deleteTarget;
    const data = clLoadData();
    const sub  = (data[cat]?.subcategorias || []).find(s => s.id === subcatId);
    if (sub) {
      const item = (sub.items || []).find(i => i.id === itemId);
      if (item?.foto) clDeleteFoto(item.foto).catch(() => {});
      sub.items = (sub.items || []).filter(i => i.id !== itemId);
      clSaveData(data);
      showToast('Item eliminado.');
      renderSidebar();
      renderContent();
    }
    closeConfirm();
  });
  $('confirm-overlay').addEventListener('click', e => {
    if (e.target === $('confirm-overlay')) closeConfirm();
  });

  /* Auto-login por sessão */
  if (sessionStorage.getItem(CL_SESSION_KEY) === '1') {
    $('login-screen').style.display = 'none';
    $('app').classList.add('visible');
    $('app').setAttribute('aria-hidden', 'false');
    initApp();
  }
});
