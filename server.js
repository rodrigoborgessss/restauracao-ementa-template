/**
 * menu-online
 * Servidor local Node.js
 *
 * Arrancar: npm install   (primeira vez)
 *           npm start     (ou: node server.js)
 *
 * Portas: http://localhost:3000/ementa/      → ementa pública
 *         http://localhost:3000/backoffice/  → backoffice
 *
 * ─────────────────────────────────────────────────────────────
 * MIGRAÇÃO PARA PHP (quando integrar no site):
 *   1. Copiar as pastas  ementa/  backoffice/  shared/  assets/
 *      para o servidor web.
 *   2. Criar upload.php  (incluído neste projecto em php/upload.php).
 *   3. Em backoffice/upload.js  alterar  UPLOAD_ENDPOINT  para
 *      apontar para  upload.php  em vez de  /api/upload .
 *   4. Apagar server.js e package.json — deixam de ser necessários.
 * ─────────────────────────────────────────────────────────────
 */

'use strict';

const http     = require('http');
const fs       = require('fs');
const path     = require('path');
const multer   = require('multer');

const PORT    = 3000;
const ROOT    = __dirname;
const ASSETS  = path.join(ROOT, 'assets', 'img');

/* ── Categorias válidas (evita path traversal) ── */
const VALID_CATS = new Set([
  'entradas', 'pratos', 'sobremesas',
  'cocktails', 'bebidas', 'vinhos'
]);

/* ── Garante que as pastas existem ── */
for (const cat of VALID_CATS) {
  fs.mkdirSync(path.join(ASSETS, cat), { recursive: true });
}

/* ── Multer: guarda em assets/img/<categoria>/ ── */
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const cat = (req.headers['x-categoria'] || '').toLowerCase().trim();
    if (!VALID_CATS.has(cat)) {
      return cb(new Error('Categoria inválida'));
    }
    cb(null, path.join(ASSETS, cat));
  },
  filename(req, file, cb) {
    const ext  = path.extname(file.originalname).toLowerCase() || '.jpg';
    const name = Date.now() + '-' + Math.random().toString(36).slice(2, 8) + ext;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 4 * 1024 * 1024 }, // 4 MB
  fileFilter(req, file, cb) {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    cb(null, allowed.includes(file.mimetype));
  }
}).single('foto');

/* ── MIME types para ficheiros estáticos ── */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css',
  '.js':   'application/javascript',
  '.json': 'application/json',
  '.svg':  'image/svg+xml',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png':  'image/png',
  '.webp': 'image/webp',
  '.gif':  'image/gif',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
};

/* ── Servidor HTTP ── */
const server = http.createServer((req, res) => {
  const method = req.method.toUpperCase();
  const url    = req.url.split('?')[0]; // ignora query string

  /* ─── POST /api/upload ─────────────────────────────────── */
  if (method === 'POST' && url === '/api/upload') {
    upload(req, res, (err) => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');

      if (err) {
        res.writeHead(400);
        return res.end(JSON.stringify({ ok: false, erro: err.message }));
      }
      if (!req.file) {
        res.writeHead(400);
        return res.end(JSON.stringify({ ok: false, erro: 'Nenhum ficheiro recebido.' }));
      }

      const cat      = (req.headers['x-categoria'] || '').toLowerCase().trim();
      const urlFoto  = `/assets/img/${cat}/${req.file.filename}`;

      res.writeHead(200);
      res.end(JSON.stringify({ ok: true, url: urlFoto }));
    });
    return;
  }

  /* ─── DELETE /api/upload?file=<path> ───────────────────── */
  if (method === 'DELETE' && url === '/api/upload') {
    let body = '';
    req.on('data', d => { body += d; });
    req.on('end', () => {
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Access-Control-Allow-Origin', '*');
      try {
        const { filePath } = JSON.parse(body);
        if (!filePath || !filePath.startsWith('/assets/img/')) {
          res.writeHead(400);
          return res.end(JSON.stringify({ ok: false, erro: 'Caminho inválido.' }));
        }
        const abs = path.join(ROOT, filePath);
        if (fs.existsSync(abs)) fs.unlinkSync(abs);
        res.writeHead(200);
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400);
        res.end(JSON.stringify({ ok: false, erro: e.message }));
      }
    });
    return;
  }

  /* ─── CORS preflight ────────────────────────────────────── */
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin':  '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Categoria',
    });
    return res.end();
  }

  /* ─── Ficheiros estáticos ───────────────────────────────── */
  if (method !== 'GET') {
    res.writeHead(405);
    return res.end('Method Not Allowed');
  }

  /* Redireccionamentos de raiz */
  if (url === '/' || url === '') {
    res.writeHead(302, { Location: '/ementa/' });
    return res.end();
  }

  /* Resolve o caminho no disco */
  let filePath = path.join(ROOT, url);

  /* Se termina em / serve index.html da pasta */
  if (url.endsWith('/')) {
    filePath = path.join(filePath, 'index.html');
  }

  /* Segurança: não sair da pasta raiz */
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }

  /* Se não tem extensão tenta index.html */
  if (!path.extname(filePath)) {
    filePath += '/index.html';
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('404 – Não encontrado: ' + url);
    }
    const ext  = path.extname(filePath).toLowerCase();
    const mime = MIME[ext] || 'application/octet-stream';
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log('');
  console.log('  ╔══════════════════════════════════════╗');
  console.log('  ║       menu-online     ║');
  console.log('  ╠══════════════════════════════════════╣');
  console.log(`  ║  Ementa    →  http://localhost:${PORT}/ementa/      ║`);
  console.log(`  ║  Backoffice→  http://localhost:${PORT}/backoffice/  ║`);
  console.log('  ╚══════════════════════════════════════╝');
  console.log('');
  console.log('  Ctrl+C para parar o servidor.');
  console.log('');
});
