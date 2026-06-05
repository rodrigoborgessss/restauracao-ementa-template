/**
 * menu-online · shared/data.js
 *
 * Dados partilhados entre a ementa pública e o backoffice.
 * Contém: chave de armazenamento, dados por defeito (exemplos),
 * e funções utilitárias usadas em ambos os módulos.
 *
 * ─────────────────────────────────────────────────────────────
 * PERSONALIZAÇÃO
 *  1. Edita CL_STORAGE_KEY se quiseres um nome único (evita
 *     conflitos se tiveres vários projectos no mesmo domínio).
 *  2. Edita CL_DEFAULT_DATA com as categorias, subcategorias
 *     e itens do teu restaurante.
 *  3. As categorias e subcategorias podem ser totalmente
 *     alteradas — adiciona, remove ou renomeia à vontade.
 * ─────────────────────────────────────────────────────────────
 */

'use strict';

/* ── Chave do localStorage ────────────────────────────────── */
const CL_STORAGE_KEY = 'menu_online_v1';

/* ═══════════════════════════════════════════════════════════
   DADOS POR DEFEITO
   Estrutura: cada categoria tem um array de subcategorias.
   Cada subcategoria tem um id, nome, nota opcional e items.
   Cada item tem: id, nome, preco, descricao, alergenios, foto.
   ═══════════════════════════════════════════════════════════ */
const CL_DEFAULT_DATA = {

  /* ── Categoria 1 ── */
  entradas: {
    subcategorias: [
      {
        id: 'frias',
        nome: 'Entradas Frias',
        items: [
          {
            id: 101,
            nome: 'Exemplo de Entrada Fria',
            preco: '6.50',
            descricao: 'Descrição do prato — ingredientes, preparação, etc.',
            alergenios: '',
            foto: '',
          },
          {
            id: 102,
            nome: 'Outra Entrada Fria',
            preco: '8.00',
            descricao: 'Descrição do prato.',
            alergenios: '(2, 7)',
            foto: '',
          },
        ],
      },
      {
        id: 'quentes',
        nome: 'Entradas Quentes',
        items: [
          {
            id: 103,
            nome: 'Exemplo de Entrada Quente',
            preco: '9.50',
            descricao: 'Descrição do prato.',
            alergenios: '(1, 4)',
            foto: '',
          },
        ],
      },
    ],
  },

  /* ── Categoria 2 ── */
  pratos: {
    subcategorias: [
      {
        id: 'peixe',
        nome: 'Peixe',
        items: [
          {
            id: 201,
            nome: 'Exemplo de Prato de Peixe',
            preco: '18.00',
            descricao: 'Descrição do prato.',
            alergenios: '(4, 7)',
            foto: '',
          },
        ],
      },
      {
        id: 'carne',
        nome: 'Carne',
        items: [
          {
            id: 202,
            nome: 'Exemplo de Prato de Carne',
            preco: '20.00',
            descricao: 'Descrição do prato.',
            alergenios: '(6)',
            foto: '',
          },
          {
            id: 203,
            nome: 'Outro Prato de Carne',
            preco: '22.00',
            descricao: 'Descrição do prato.',
            alergenios: '',
            foto: '',
          },
        ],
      },
      {
        id: 'vegetariano',
        nome: 'Vegetariano',
        items: [
          {
            id: 204,
            nome: 'Exemplo Vegetariano',
            preco: '14.00',
            descricao: 'Descrição do prato.',
            alergenios: '(2, 4)',
            foto: '',
          },
        ],
      },
    ],
  },

  /* ── Categoria 3 ── */
  sobremesas: {
    subcategorias: [
      {
        id: 'sobremesas',
        nome: 'Sobremesas',
        items: [
          {
            id: 301,
            nome: 'Exemplo de Sobremesa',
            preco: '5.00',
            descricao: 'Descrição da sobremesa.',
            alergenios: '(1, 2)',
            foto: '',
          },
          {
            id: 302,
            nome: 'Outra Sobremesa',
            preco: '5.50',
            descricao: 'Descrição da sobremesa.',
            alergenios: '(1)',
            foto: '',
          },
        ],
      },
    ],
  },

  /* ── Categoria 4 ── */
  bebidas: {
    subcategorias: [
      {
        id: 'sem-alcool',
        nome: 'Sem Álcool',
        items: [
          { id: 401, nome: 'Água (50 cl)',          preco: '1.50', descricao: '', alergenios: '', foto: '' },
          { id: 402, nome: 'Refrigerante',           preco: '2.50', descricao: '', alergenios: '', foto: '' },
          { id: 403, nome: 'Sumo Natural de Laranja',preco: '3.50', descricao: '', alergenios: '', foto: '' },
        ],
      },
      {
        id: 'cervejas',
        nome: 'Cervejas',
        items: [
          { id: 404, nome: 'Imperial',       preco: '1.80', descricao: '', alergenios: '', foto: '' },
          { id: 405, nome: 'Caneca (0,5L)',  preco: '3.50', descricao: '', alergenios: '', foto: '' },
        ],
      },
      {
        id: 'vinhos',
        nome: 'Vinhos',
        items: [
          { id: 406, nome: 'Vinho Tinto — Copo',    preco: '3.00', descricao: 'Consulte a sugestão da semana', alergenios: '', foto: '' },
          { id: 407, nome: 'Vinho Branco — Copo',   preco: '3.00', descricao: 'Consulte a sugestão da semana', alergenios: '', foto: '' },
          { id: 408, nome: 'Jarro de Vinho (0,5L)', preco: '8.00', descricao: '', alergenios: '', foto: '' },
        ],
      },
      {
        id: 'cafetaria',
        nome: 'Cafetaria',
        items: [
          { id: 409, nome: 'Café',          preco: '1.20', descricao: '', alergenios: '', foto: '' },
          { id: 410, nome: 'Meia de Leite', preco: '1.80', descricao: '', alergenios: '', foto: '' },
          { id: 411, nome: 'Chá',           preco: '1.80', descricao: '', alergenios: '', foto: '' },
        ],
      },
    ],
  },

};

/* ═══════════════════════════════════════════════════════════
   FUNÇÕES UTILITÁRIAS
   Partilhadas entre ementa/app.js e backoffice/app.js.
   ═══════════════════════════════════════════════════════════ */

/**
 * Carrega os dados do localStorage.
 * Se não existirem dados, usa CL_DEFAULT_DATA.
 */
function clLoadData() {
  try {
    const raw = localStorage.getItem(CL_STORAGE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(CL_DEFAULT_DATA));
    return JSON.parse(raw);
  } catch (e) {
    console.warn('[menu-online] Erro ao carregar dados:', e);
    return JSON.parse(JSON.stringify(CL_DEFAULT_DATA));
  }
}

/**
 * Guarda os dados no localStorage.
 */
function clSaveData(data) {
  try {
    localStorage.setItem(CL_STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('[menu-online] Erro ao guardar dados:', e);
  }
}

/**
 * Escapa uma string para uso seguro em HTML (previne XSS).
 */
function clEscape(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

/**
 * Formata um preço para exibição.
 * Exemplo: "18.5" → "18,50 €"
 * Personaliza o símbolo de moeda se necessário.
 */
function clFormatPreco(preco) {
  const n = parseFloat(preco);
  if (isNaN(n)) return '—';
  return n.toFixed(2).replace('.', ',') + ' €';
}

/**
 * Gera o próximo ID único para um novo item.
 */
function clNextId(data) {
  const allIds = [];
  Object.keys(data).forEach(cat => {
    (data[cat]?.subcategorias || []).forEach(sub => {
      (sub.items || []).forEach(item => allIds.push(item.id));
    });
  });
  return allIds.length ? Math.max(...allIds) + 1 : 1;
}
