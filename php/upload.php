<?php
/**
 * menu-online – Ementa Online
 * upload.php — equivalente PHP do endpoint /api/upload do server.js
 *
 * Colocar na raiz do site (junto a ementa/ e backoffice/).
 * Requer PHP 7.4+ e permissão de escrita na pasta assets/img/.
 *
 * ── MIGRAÇÃO ──────────────────────────────────────────────────
 *  1. Copiar este ficheiro para a raiz do site.
 *  2. Em backoffice/upload.js alterar:
 *       const UPLOAD_ENDPOINT = '/upload.php';
 *  3. Garantir que assets/img/ e subpastas têm permissão 755.
 * ──────────────────────────────────────────────────────────────
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Categoria');

/* Preflight CORS */
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

$VALID_CATS = ['entradas', 'pratos', 'sobremesas', 'cocktails', 'bebidas', 'vinhos'];
$ASSETS_DIR = __DIR__ . '/assets/img/';

/* ── DELETE: apagar foto ─────────────────────────────────── */
if ($_SERVER['REQUEST_METHOD'] === 'DELETE') {
    $body     = json_decode(file_get_contents('php://input'), true);
    $filePath = $body['filePath'] ?? '';

    if (!$filePath || strpos($filePath, '/assets/img/') !== 0) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'erro' => 'Caminho inválido.']);
        exit;
    }

    $abs = realpath(__DIR__ . $filePath);
    if ($abs && strpos($abs, realpath($ASSETS_DIR)) === 0 && file_exists($abs)) {
        unlink($abs);
    }

    echo json_encode(['ok' => true]);
    exit;
}

/* ── POST: fazer upload ──────────────────────────────────── */
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'erro' => 'Método não permitido.']);
    exit;
}

/* Valida categoria */
$cat = strtolower(trim($_SERVER['HTTP_X_CATEGORIA'] ?? ''));
if (!in_array($cat, $VALID_CATS, true)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'erro' => 'Categoria inválida.']);
    exit;
}

/* Verifica ficheiro */
if (empty($_FILES['foto']) || $_FILES['foto']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'erro' => 'Nenhum ficheiro recebido.']);
    exit;
}

$file = $_FILES['foto'];

/* Valida tipo MIME */
$allowed_mime = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
$finfo        = finfo_open(FILEINFO_MIME_TYPE);
$mime         = finfo_file($finfo, $file['tmp_name']);
finfo_close($finfo);

if (!in_array($mime, $allowed_mime, true)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'erro' => 'Tipo de ficheiro não permitido.']);
    exit;
}

/* Valida tamanho (4 MB) */
if ($file['size'] > 4 * 1024 * 1024) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'erro' => 'Ficheiro demasiado grande (máx. 4 MB).']);
    exit;
}

/* Extensão segura a partir do MIME */
$ext_map = [
    'image/jpeg' => '.jpg',
    'image/png'  => '.png',
    'image/webp' => '.webp',
    'image/gif'  => '.gif',
];
$ext = $ext_map[$mime];

/* Cria pasta e move ficheiro */
$dest_dir = $ASSETS_DIR . $cat . '/';
if (!is_dir($dest_dir)) {
    mkdir($dest_dir, 0755, true);
}

$filename = time() . '-' . bin2hex(random_bytes(3)) . $ext;
$dest     = $dest_dir . $filename;

if (!move_uploaded_file($file['tmp_name'], $dest)) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'erro' => 'Erro ao guardar o ficheiro.']);
    exit;
}

$url = '/assets/img/' . $cat . '/' . $filename;
echo json_encode(['ok' => true, 'url' => $url]);
