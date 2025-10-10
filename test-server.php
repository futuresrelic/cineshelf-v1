<?php
/**
 * CineShelf Server Test Script
 * Place this in your cineshelf-test/ folder and access via browser
 * It will test your server setup and show you what's working
 */

header('Content-Type: text/html; charset=utf-8');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>CineShelf Server Test</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            max-width: 900px;
            margin: 40px auto;
            padding: 20px;
            background: #f5f5f5;
        }
        .test-section {
            background: white;
            padding: 20px;
            margin: 20px 0;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h1 { color: #333; }
        h2 { color: #666; margin-top: 0; }
        .success { color: #22c55e; font-weight: bold; }
        .error { color: #ef4444; font-weight: bold; }
        .warning { color: #f59e0b; font-weight: bold; }
        .info { color: #3b82f6; font-weight: bold; }
        pre {
            background: #f8f9fa;
            padding: 12px;
            border-radius: 4px;
            overflow-x: auto;
            border-left: 4px solid #3b82f6;
        }
        code {
            background: #f8f9fa;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        th, td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
        }
        th {
            background: #f9fafb;
            font-weight: 600;
        }
        .status-badge {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 0.85em;
            font-weight: 600;
        }
        .status-ok { background: #dcfce7; color: #166534; }
        .status-error { background: #fee2e2; color: #991b1b; }
        .status-warning { background: #fef3c7; color: #92400e; }
    </style>
</head>
<body>
    <h1>🎬 CineShelf Server Test</h1>
    <p style="color: #666;">This page tests your CineShelf v3 server configuration</p>

    <?php
    $tests = [];
    $allPassed = true;

    // Test 1: Check if PHP is working
    $tests['PHP Version'] = [
        'status' => PHP_VERSION >= '7.0' ? 'ok' : 'error',
        'message' => 'PHP ' . PHP_VERSION,
        'details' => PHP_VERSION >= '7.0' ? 'Version is compatible' : 'Upgrade to PHP 7.0+'
    ];

    // Test 2: Check backup.php exists
    $backupExists = file_exists(__DIR__ . '/backup.php');
    $tests['backup.php'] = [
        'status' => $backupExists ? 'ok' : 'error',
        'message' => $backupExists ? 'File exists' : 'File NOT found',
        'details' => $backupExists ? 'Located in root folder' : 'Upload backup.php to root'
    ];
    if (!$backupExists) $allPassed = false;

    // Test 3: Check restore.php exists
    $restoreExists = file_exists(__DIR__ . '/restore.php');
    $tests['restore.php'] = [
        'status' => $restoreExists ? 'ok' : 'error',
        'message' => $restoreExists ? 'File exists' : 'File NOT found',
        'details' => $restoreExists ? 'Located in root folder' : 'Upload restore.php to root'
    ];
    if (!$restoreExists) $allPassed = false;

    // Test 4: Check data/ folder
    $dataDir = __DIR__ . '/data';
    $dataExists = file_exists($dataDir);
    $dataWritable = $dataExists && is_writable($dataDir);
    
    if (!$dataExists) {
        $tests['data/ folder'] = [
            'status' => 'error',
            'message' => 'Folder does NOT exist',
            'details' => 'Create folder: mkdir data && chmod 755 data'
        ];
        $allPassed = false;
    } else if (!$dataWritable) {
        $tests['data/ folder'] = [
            'status' => 'warning',
            'message' => 'Folder exists but not writable',
            'details' => 'Fix permissions: chmod 755 data'
        ];
        $allPassed = false;
    } else {
        $tests['data/ folder'] = [
            'status' => 'ok',
            'message' => 'Folder exists and writable',
            'details' => 'Permissions: ' . substr(sprintf('%o', fileperms($dataDir)), -4)
        ];
    }

    // Test 5: Check for duplicate api/ files
    $apiBackup = file_exists(__DIR__ . '/api/backup.php');
    $apiRestore = file_exists(__DIR__ . '/api/restore.php');
    
    if ($apiBackup || $apiRestore) {
        $tests['Duplicate Files Check'] = [
            'status' => 'warning',
            'message' => 'Old api/ folder files detected',
            'details' => 'Delete api/backup.php and api/restore.php (use root versions only)'
        ];
    } else {
        $tests['Duplicate Files Check'] = [
            'status' => 'ok',
            'message' => 'No duplicate files found',
            'details' => 'Clean structure - using root-level PHP files only'
        ];
    }

    // Test 6: Check for existing backups
    if ($dataExists) {
        $backupFiles = glob($dataDir . '/cineshelf_backup_*.json');
        $backupCount = count($backupFiles);
        
        $tests['Existing Backups'] = [
            'status' => 'info',
            'message' => $backupCount > 0 ? "{$backupCount} backup file(s) found" : 'No backups yet',
            'details' => $backupCount > 0 ? 'Backups are being saved correctly' : 'Create your first backup from the app'
        ];
    }

    // Test 7: Check JSON extension
    $jsonEnabled = function_exists('json_encode');
    $tests['JSON Support'] = [
        'status' => $jsonEnabled ? 'ok' : 'error',
        'message' => $jsonEnabled ? 'JSON extension enabled' : 'JSON extension MISSING',
        'details' => $jsonEnabled ? 'Required for backup/restore' : 'Enable JSON extension in PHP'
    ];
    if (!$jsonEnabled) $allPassed = false;

    // Display results
    ?>

    <div class="test-section">
        <h2>📋 Test Results</h2>
        <?php if ($allPassed): ?>
            <p class="success">✅ All critical tests passed! Your server is ready.</p>
        <?php else: ?>
            <p class="error">❌ Some tests failed. Fix the errors below before proceeding.</p>
        <?php endif; ?>

        <table>
            <thead>
                <tr>
                    <th>Test</th>
                    <th>Status</th>
                    <th>Details</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($tests as $testName => $result): ?>
                    <tr>
                        <td><strong><?php echo htmlspecialchars($testName); ?></strong></td>
                        <td>
                            <span class="status-badge status-<?php echo $result['status']; ?>">
                                <?php 
                                if ($result['status'] === 'ok') echo '✓ ' . $result['message'];
                                elseif ($result['status'] === 'error') echo '✗ ' . $result['message'];
                                elseif ($result['status'] === 'warning') echo '⚠ ' . $result['message'];
                                else echo 'ℹ ' . $result['message'];
                                ?>
                            </span>
                        </td>
                        <td><?php echo htmlspecialchars($result['details']); ?></td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>

    <?php if ($dataExists && $backupCount > 0): ?>
    <div class="test-section">
        <h2>💾 Existing Backup Files</h2>
        <table>
            <thead>
                <tr>
                    <th>Filename</th>
                    <th>Size</th>
                    <th>Modified</th>
                    <th>User</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($backupFiles as $file): ?>
                    <?php
                    $filename = basename($file);
                    $size = round(filesize($file) / 1024, 2) . ' KB';
                    $modified = date('Y-m-d H:i:s', filemtime($file));
                    $user = str_replace(['cineshelf_backup_', '.json'], '', $filename);
                    ?>
                    <tr>
                        <td><code><?php echo htmlspecialchars($filename); ?></code></td>
                        <td><?php echo $size; ?></td>
                        <td><?php echo $modified; ?></td>
                        <td><?php echo htmlspecialchars($user); ?></td>
                    </tr>
                <?php endforeach; ?>
            </tbody>
        </table>
    </div>
    <?php endif; ?>

    <div class="test-section">
        <h2>🔍 Server Information</h2>
        <table>
            <tr>
                <td><strong>Server Software</strong></td>
                <td><?php echo $_SERVER['SERVER_SOFTWARE'] ?? 'Unknown'; ?></td>
            </tr>
            <tr>
                <td><strong>PHP Version</strong></td>
                <td><?php echo PHP_VERSION; ?></td>
            </tr>
            <tr>
                <td><strong>Document Root</strong></td>
                <td><code><?php echo __DIR__; ?></code></td>
            </tr>
            <tr>
                <td><strong>Current Time</strong></td>
                <td><?php echo date('Y-m-d H:i:s T'); ?></td>
            </tr>
        </table>
    </div>

    <div class="test-section">
        <h2>📝 Next Steps</h2>
        <?php if ($allPassed): ?>
            <ol>
                <li>✅ Your server setup is correct</li>
                <li>Open <code>index.html</code> in your browser</li>
                <li>Try adding a movie to your collection</li>
                <li>Test the backup feature</li>
                <li>Test the restore feature</li>
            </ol>
        <?php else: ?>
            <ol>
                <li>Fix the errors shown in the test results above</li>
                <li>Refresh this page to verify fixes</li>
                <li>Once all tests pass, open <code>index.html</code></li>
            </ol>
        <?php endif; ?>
    </div>

    <div class="test-section" style="background: #eff6ff; border-left: 4px solid #3b82f6;">
        <h2>💡 Quick Fixes</h2>
        <p><strong>If data/ folder doesn't exist:</strong></p>
        <pre>mkdir data
chmod 755 data</pre>

        <p><strong>If backup.php or restore.php missing:</strong></p>
        <p>Download them from the artifacts provided by Claude and upload to your server root.</p>

        <p><strong>If you see duplicate files warning:</strong></p>
        <pre>rm -f api/backup.php
rm -f api/restore.php</pre>
    </div>

    <p style="text-align: center; margin-top: 40px; color: #999;">
        <small>CineShelf v3.0 Server Test | <?php echo date('Y-m-d H:i:s'); ?></small>
    </p>
</body>
</html>