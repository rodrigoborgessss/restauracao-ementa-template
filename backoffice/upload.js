/**
 * Chico Lobo – Backoffice · upload.js
 *
 * Módulo de upload de fotos.
 * É o ÚNICO ficheiro a alterar quando migrar de Node.js para PHP.
 *
 * ── MIGRAÇÃO PARA PHP ─────────────────────────────────────────
 *  1. Alterar UPLOAD_ENDPOINT abaixo para apontar para upload.php:
 *       const UPLOAD_ENDPOINT = '/upload.php';
 *  2. Apagar server.js e package.json.
 *  3. Copiar php/upload.php para a raiz do site.
 *  Mais nada precisa de mudar.
 * ──────────────────────────────────────────────────────────────
 */

'use strict';

/* ── CONFIGURAÇÃO ─────────────────────────────────────────────
   Node.js local:  '/api/upload'
   PHP em produção: '/upload.php'   (ou caminho relativo ao site)
   ──────────────────────────────────────────────────────────── */
const UPLOAD_ENDPOINT = '/api/upload';

/**
 * Faz upload de um ficheiro de imagem para o servidor.
 *
 * @param {File}   file      — objecto File do input
 * @param {string} categoria — ex: 'entradas', 'pratos', ...
 * @returns {Promise<string>} URL pública da foto (ex: /assets/img/entradas/foto.jpg)
 * @throws {Error} se o upload falhar
 */
async function clUploadFoto(file, categoria) {
  const formData = new FormData();
  formData.append('foto', file);

  const res = await fetch(UPLOAD_ENDPOINT, {
    method:  'POST',
    headers: { 'X-Categoria': categoria },
    body:    formData,
  });

  if (!res.ok) {
    throw new Error(`Erro HTTP ${res.status}`);
  }

  const json = await res.json();
  if (!json.ok) {
    throw new Error(json.erro || 'Erro desconhecido no upload.');
  }

  return json.url; // ex: '/assets/img/entradas/1234567890-abc123.jpg'
}

/**
 * Apaga uma foto do servidor.
 * Chamado quando o utilizador remove a foto de um item
 * ou quando substitui por uma nova.
 *
 * @param {string} filePath — caminho retornado pelo upload (ex: /assets/img/...)
 * @returns {Promise<void>}
 */
async function clDeleteFoto(filePath) {
  if (!filePath || !filePath.startsWith('/assets/img/')) return;

  try {
    await fetch(UPLOAD_ENDPOINT, {
      method:  'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ filePath }),
    });
  } catch (e) {
    // falha silenciosa — o ficheiro pode já não existir
    console.warn('[CL] Não foi possível apagar foto:', filePath, e);
  }
}
