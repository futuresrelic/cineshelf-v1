<?php
/**
 * CineShelf Backup Script - Clean Single Version
 * Saves user data to data/ folder
 * Place in web root only (no api/ folder copy needed)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-User-ID, X-Backup-Version');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Only accept POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed - use POST']);
    exit;
}

// Get and validate input
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['user'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid data - user field required']);
    exit;
}

// Sanitize username (alphanumeric, hyphens, underscores only)
$user = preg_replace('/[^a-zA-Z0-9_-]/', '', $input['user']);

if (empty($user)) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid username format']);
    exit;
}

// Create data directory if it doesn't exist
$dataDir = __DIR__ . '/data';
if (!file_exists($dataDir)) {
    if (!mkdir($dataDir, 0755, true)) {
        http_response_code(500);
        echo json_encode(['error' => 'Could not create data directory']);
        exit;
    }
}

// CONSISTENT filename format
$filename = $dataDir . "/cineshelf_backup_{$user}.json";

// Add metadata to backup
$input['_backup_metadata'] = [
    'user' => $user,
    'timestamp' => date('c'),
    'server_time' => date('Y-m-d H:i:s'),
    'version' => '3.0-unified',
    'filename' => basename($filename)
];

// Log for debugging (check your PHP error log)
error_log("CineShelf Backup: User '{$user}' -> '{$filename}'");

// Write backup file
$jsonData = json_encode($input, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
if (file_put_contents($filename, $jsonData) === false) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to write backup file',
        'filename' => basename($filename)
    ]);
    exit;
}

// Success response
echo json_encode([
    'success' => true,
    'message' => 'Backup saved successfully',
    'filename' => basename($filename),
    'user' => $user,
    'timestamp' => date('c'),
    'size_kb' => round(strlen($jsonData) / 1024, 2),
    'items_count' => count($input['copies'] ?? []),
    'movies_count' => count($input['movies'] ?? [])
]);

error_log("CineShelf Backup: SUCCESS - {$filename}");
?>