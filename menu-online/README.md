# menu-online

**Ementa digital para restaurantes** — simples de instalar, fácil de personalizar.

QR Code na mesa → cliente abre a ementa no telemóvel. A equipa gere os pratos pelo backoffice sem tocar em código.

---

## Funcionalidades

- **Ementa pública** — responsiva, optimizada para mobile e QR Code
- **Backoffice** — gestão completa de itens (criar, editar, eliminar, reordenar)
- **Categorias e subcategorias** configuráveis
- **Upload de fotos** por prato, guardadas em disco
- **Drag-and-drop** para reordenar pratos
- **Actualização em tempo real** — ementa reflecte alterações do backoffice sem recarregar
- Zero dependências no frontend (HTML/CSS/JS puro)
- Servidor Node.js mínimo para desenvolvimento local
- Pronto para migrar para PHP em produção

---

## Estrutura

```
menu-online/
├── server.js              ← servidor Node.js (desenvolvimento local)
├── package.json
├── php/
│   └── upload.php         ← equivalente PHP para produção
├── assets/
│   ├── hero.jpg           ← imagem do hero (substituir)
│   ├── logo.svg           ← logótipo (opcional)
│   └── img/
│       ├── entradas/      ← fotos dos pratos por categoria
│       ├── pratos/
│       ├── sobremesas/
│       └── bebidas/
├── shared/
│   └── data.js            ← dados e funções partilhadas
├── ementa/
│   ├── index.html
│   ├── style.css
│   └── app.js
└── backoffice/
    ├── index.html
    ├── style.css
    ├── upload.js          ← único ficheiro a alterar na migração para PHP
    └── app.js
```

---

## Início rápido

### Pré-requisitos
- [Node.js](https://nodejs.org/) 16+

### Instalar e arrancar

```bash
git clone https://github.com/teu-utilizador/menu-online.git
cd menu-online
npm install
npm start
```

Abre no browser:

| URL | Descrição |
|-----|-----------|
| `http://localhost:3000/ementa/` | Ementa pública |
| `http://localhost:3000/backoffice/` | Backoffice de gestão |

**Login de teste:** `admin` / `admin`

---

## Personalização

### 1. Categorias e itens (`shared/data.js`)

Edita `CL_DEFAULT_DATA` com as categorias do teu restaurante:

```js
const CL_DEFAULT_DATA = {
  entradas: {
    subcategorias: [
      {
        id: 'frias',
        nome: 'Entradas Frias',
        items: [
          {
            id: 101,
            nome: 'Nome do prato',
            preco: '8.50',
            descricao: 'Ingredientes e descrição',
            alergenios: '(1, 4)',
            foto: '',
          },
        ],
      },
    ],
  },
  // mais categorias...
};
```

### 2. Tabs da ementa (`ementa/index.html`)

Adiciona ou remove botões de tab conforme as tuas categorias:

```html
<button class="tab-btn active" data-cat="entradas">Entradas</button>
<button class="tab-btn" data-cat="pratos">Pratos</button>
<!-- o data-cat tem de corresponder às chaves em CL_DEFAULT_DATA -->
```

E os painéis correspondentes:
```html
<div class="cat-panel active" id="panel-entradas"><div class="cat-inner"></div></div>
<div class="cat-panel" id="panel-pratos"><div class="cat-inner"></div></div>
```

### 3. Labels do backoffice (`backoffice/app.js`)

```js
const CAT_LABELS = {
  entradas:   'Entradas',
  pratos:     'Pratos',
  // ...
};
```

### 4. Layout de lista vs. cards

Por defeito, categorias em `LIST_CATS` (`ementa/app.js`) usam layout de lista (útil para bebidas e vinhos). As restantes usam cards com foto.

```js
const LIST_CATS = ['bebidas', 'vinhos'];
```

### 5. Visual (`ementa/style.css`)

Todas as cores e fontes estão em variáveis CSS em `:root`:

```css
:root {
  --bg:           #1a1a2e;   /* fundo geral        */
  --accent:       #e0a045;   /* cor de destaque    */
  --font-serif:   'Cormorant Garamond', Georgia, serif;
  --font-sans:    'Raleway', system-ui, sans-serif;
  /* ... */
}
```

### 6. Logótipo e hero

- **Logótipo:** substitui `<span class="nav__logo-text">` por `<img src="../assets/logo.svg">` em ambos os `index.html`
- **Hero:** coloca a tua imagem em `assets/hero.jpg` (já referenciada no HTML)

---

## Migração para PHP (produção)

1. Copia as pastas `ementa/`, `backoffice/`, `shared/`, `assets/` para o servidor
2. Copia `php/upload.php` para a raiz do site
3. Em `backoffice/upload.js` altera **uma linha**:
   ```js
   const UPLOAD_ENDPOINT = '/upload.php';   // era '/api/upload'
   ```
4. Garante que `assets/img/` tem permissão de escrita (`chmod 755`)
5. Apaga `server.js` e `package.json`

---

## Segurança

- CSP (`Content-Security-Policy`) activado em ambas as páginas
- Inputs sanitizados contra XSS
- Upload validado por MIME type e tamanho (máx. 4 MB)
- Backoffice com `noindex, nofollow`
- **Atenção:** o login `admin/admin` é apenas para desenvolvimento local. Em produção, implementa autenticação server-side.

---

## Licença

MIT — usa, modifica e distribui à vontade.
