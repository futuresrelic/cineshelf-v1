<?php
/**
 * CineShelf Restore Script - Clean Single Version
 * Loads user data from data/ folder
 * Place in web root only (no api/ folder copy needed)
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: X-User-ID, X-Restore-Version, X-Device-Type, Content-Type');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit(0);
}

// Get user from GET or POST
$user = '';
$forceFile = '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user = $_GET['user'] ?? '';
    $forceFile = $_GET['file'] ?? '';
} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $user = $input['user'] ?? '';
    $forceFile = $input['file'] ?? '';
}

// Sanitize username
$user = preg_replace('/[^a-zA-Z0-9_-]/', '', $user);

if (!$user) {
    http_response_code(400);
    echo json_encode(['error' => 'User parameter required']);
    exit;
}

$dataDir = __DIR__ . '/data';

// Function to find backup files for a user
function findBackupFiles($dataDir, $user) {
    $files = [];
    
    if (!file_exists($dataDir)) {
        return $files;
    }
    
    // Look for exact match first
    $exactFile = $dataDir . "/cineshelf_backup_{$user}.json";
    if (file_exists($exactFile)) {
        $files[] = $exactFile;
    }
    
    // Look for any files containing the username
    $pattern = $dataDir . "/cineshelf_backup_*.json";
    $allFiles = glob($pattern);
    
    foreach ($allFiles as $file) {
        $basename = basename($file, '.json');
        if (strpos($basename, $user) !== false && $file !== $exactFile) {
            $files[] = $file;
        }
    }
    
    // Sort by modification time (newest first)
    usort($files, function($a, $b) {
        return filemtime($b) - filemtime($a);
    });
    
    return $files;
}

// Determine which file to restore
$filename = null;

if ($forceFile) {
    // Specific file requested
    $sanitizedFile = basename($forceFile);
    $filename = $dataDir . '/' . $sanitizedFile;
    
    if (!file_exists($filename)) {
        http_response_code(404);
        echo json_encode([
            'error' => 'Specified file not found',
            'file' => $sanitizedFile
        ]);
        exit;
    }
} else {
    // Find best backup file for user
    $availableFiles = findBackupFiles($dataDir, $user);
    
    if (empty($availableFiles)) {
        // No files found - provide helpful error
        $allFiles = glob($dataDir . "/cineshelf_backup_*.json");
        
        http_response_code(404);
        echo json_encode([
            'error' => 'No backup found for this user',
            'user' => $user,
            'available_backups' => array_map(function($file) {
                $basename = basename($file, '.json');
                $userPart = str_replace('cineshelf_backup_', '', $basename);
                return [
                    'filename' => basename($file),
                    'user_part' => $userPart,
                    'modified' => date('c', filemtime($file)),
                    'size_kb' => round(filesize($file) / 1024, 2)
                ];
            }, $allFiles),
            'suggestion' => 'No backup exists yet - create one first'
        ]);
        exit;
    }
    
    $filename = $availableFiles[0]; // Use most recent
}

// Read the backup file
$data = file_get_contents($filename);
if ($data === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to read backup file']);
    exit;
}

// Validate JSON
$jsonData = json_decode($data, true);
if ($jsonData === null) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Backup file contains invalid JSON',
        'json_error' => json_last_error_msg()
    ]);
    exit;
}

// Add restore metadata
$jsonData['_restore_metadata'] = [
    'filename_used' => basename($filename),
    'restored_at' => date('c'),
    'user_requested' => $user,
    'file_forced' => !empty($forceFile),
    'file_modified' => date('c', filemtime($filename)),
    'version' => '3.0-unified'
];

// Log restore
error_log("CineShelf Restore: User '{$user}' <- '{$filename}'");

// Return the data
echo json_encode($jsonData);
?>