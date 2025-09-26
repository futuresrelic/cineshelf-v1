<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: X-User-ID, X-Restore-Version, X-Device-Type, Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Handle both GET and POST requests
$user = '';
$forceFile = '';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $user = isset($_GET['user']) ? $_GET['user'] : '';
    $forceFile = isset($_GET['file']) ? $_GET['file'] : '';
} else if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = json_decode(file_get_contents('php://input'), true);
    $user = $input['user'] ?? '';
    $forceFile = $input['file'] ?? '';
}

$user = preg_replace('/[^a-zA-Z0-9_-]/', '', $user);

if (!$user) {
    http_response_code(400);
    echo json_encode(['error' => 'User parameter required']);
    exit;
}

// ENHANCED: Function to find backup files with strict format checking (API version)
function findBackupFiles($user) {
    $files = [];
    
    // Ensure data directory exists (relative to api folder)
    if (!file_exists('../data')) {
        error_log("CineShelf API Restore: Data directory does not exist");
        return $files;
    }
    
    // STRICT: Only look for files with the correct naming convention
    $exactFile = "../data/cineshelf_backup_{$user}.json";
    
    error_log("CineShelf API Restore: Looking for exact file: {$exactFile}");
    
    if (file_exists($exactFile)) {
        $files[] = $exactFile;
        error_log("CineShelf API Restore: Found exact match: {$exactFile}");
    }
    
    // Look for any other files with correct prefix that contain the username
    $allFiles = glob("../data/cineshelf_backup_*.json");
    error_log("CineShelf API Restore: Found " . count($allFiles) . " total backup files with correct format");
    
    foreach ($allFiles as $file) {
        $basename = basename($file, '.json');
        $userPart = str_replace('cineshelf_backup_', '', $basename);
        
        // Add if it matches the user and isn't already added
        if (strpos($userPart, $user) !== false && !in_array($file, $files)) {
            $files[] = $file;
            error_log("CineShelf API Restore: Added matching file: {$file}");
        }
    }
    
    // Sort by modification time (newest first)
    usort($files, function($a, $b) {
        return filemtime($b) - filemtime($a);
    });
    
    error_log("CineShelf API Restore: Final file list: " . implode(', ', $files));
    return $files;
}

// If specific file requested, use it (but ensure it's in data folder with correct format)
if ($forceFile) {
    // Sanitize and ensure correct path
    $cleanFile = basename($forceFile);
    
    // Force correct format if user specified old format
    if (strpos($cleanFile, 'cineshelf_backup_') !== 0) {
        // Convert old format to new format
        $cleanFile = str_replace('backup_', 'cineshelf_backup_', $cleanFile);
    }
    
    $filename = "../data/" . $cleanFile;
    error_log("CineShelf API Restore: Force file requested: {$forceFile} -> {$filename}");
    
    if (!file_exists($filename)) {
        error_log("CineShelf API Restore: Forced file not found: {$filename}");
        http_response_code(404);
        echo json_encode(['error' => 'Specified file not found', 'file' => $forceFile, 'looked_for' => $filename]);
        exit;
    }
} else {
    // Find best backup file for user
    $availableFiles = findBackupFiles($user);
    
    if (empty($availableFiles)) {
        error_log("CineShelf API Restore: No files found for user: {$user}");
        
        // List all available files for debugging (only correct format)
        $allFiles = glob("../data/cineshelf_backup_*.json");
        
        // ALSO check for old format files to help with migration
        $oldFiles = glob("../data/backup_*.json");
        $rootOldFiles = glob("../backup_*.json");
        
        http_response_code(404);
        echo json_encode([
            'error' => 'No backup found for this user',
            'user' => $user,
            'available_backups' => array_map(function($file) {
                $basename = basename($file, '.json');
                $user_part = str_replace('cineshelf_backup_', '', $basename);
                return [
                    'filename' => basename($file),
                    'user_part' => $user_part,
                    'modified' => date('c', filemtime($file)),
                    'size' => filesize($file),
                    'format' => 'correct'
                ];
            }, $allFiles),
            'old_format_files_found' => [
                'data_folder' => array_map('basename', $oldFiles),
                'root_folder' => array_map('basename', $rootOldFiles)
            ],
            'suggestion' => 'Delete old format files and use only cineshelf_backup_*.json format',
            'debug_info' => [
                'correct_pattern' => '../data/cineshelf_backup_*.json',
                'user_searched' => $user,
                'exact_file_checked' => "../data/cineshelf_backup_{$user}.json"
            ]
        ]);
        exit;
    }
    
    $filename = $availableFiles[0]; // Use most recent
    error_log("CineShelf API Restore: Selected file: {$filename}");
}

// Read and return the backup data
$data = file_get_contents($filename);
if ($data === false) {
    error_log("CineShelf API Restore: Failed to read file: {$filename}");
    http_response_code(500);
    echo json_encode(['error' => 'Failed to read backup file', 'filename' => $filename]);
    exit;
}

// Verify it's valid JSON
$jsonData = json_decode($data, true);
if ($jsonData === null) {
    error_log("CineShelf API Restore: Invalid JSON in file: {$filename}");
    http_response_code(500);
    echo json_encode(['error' => 'Backup file contains invalid JSON', 'filename' => $filename]);
    exit;
}

// Add metadata about which file was used
$jsonData['_restore_metadata'] = [
    'filename_used' => basename($filename),
    'full_path_used' => $filename,
    'restored_at' => date('c'),
    'user_requested' => $user,
    'file_forced' => !empty($forceFile),
    'endpoint_used' => 'api',
    'file_size' => filesize($filename),
    'file_modified' => date('c', filemtime($filename))
];

error_log("CineShelf API Restore: SUCCESS - Restored from {$filename} for user {$user}");
echo json_encode($jsonData);
?>