<?php
header('Content-Type: text/html; charset=utf-8');
header('Access-Control-Allow-Origin: *');

echo "<!DOCTYPE html><html><head><title>CineShelf Backup Cleanup</title>";
echo "<style>
body{font-family:Arial,sans-serif;margin:20px;} 
table{border-collapse:collapse;width:100%;} 
th,td{border:1px solid #ddd;padding:8px;text-align:left;} 
th{background-color:#f2f2f2;} 
.success{color:green;} 
.error{color:red;} 
.warning{color:orange;} 
.info{color:blue;} 
pre{background:#f0f0f0;padding:10px;border-radius:4px;}
.btn{padding:5px 10px;margin:2px;text-decoration:none;border-radius:3px;cursor:pointer;border:none;}
.btn-danger{background:#dc3545;color:white;}
.btn-success{background:#28a745;color:white;}
.btn-primary{background:#007bff;color:white;}
</style>";
echo "</head><body>";

echo "<h2>🧹 CineShelf Backup Cleanup Tool</h2>";

// Handle cleanup actions
if (isset($_GET['action'])) {
    $action = $_GET['action'];
    
    if ($action === 'cleanup_all') {
        $deletedFiles = [];
        
        // Clean up old format files in root
        $rootOldFiles = glob("../backup_*.json");
        foreach ($rootOldFiles as $file) {
            if (unlink($file)) {
                $deletedFiles[] = "root/" . basename($file);
            }
        }
        
        // Clean up old format files in data folder
        $dataOldFiles = glob("../data/backup_*.json");
        foreach ($dataOldFiles as $file) {
            if (unlink($file)) {
                $deletedFiles[] = "data/" . basename($file);
            }
        }
        
        if (count($deletedFiles) > 0) {
            echo "<div class='success'><h3>✅ Cleanup Complete!</h3>";
            echo "<p>Deleted " . count($deletedFiles) . " old backup files:</p><ul>";
            foreach ($deletedFiles as $file) {
                echo "<li>{$file}</li>";
            }
            echo "</ul></div>";
        } else {
            echo "<div class='info'><h3>ℹ️ No Old Files Found</h3><p>No old format backup files were found to delete.</p></div>";
        }
        
        echo "<p><a href='?' class='btn btn-primary'>🔄 Refresh Analysis</a></p>";
    }
    
    if ($action === 'delete_specific' && isset($_GET['file'])) {
        $fileToDelete = $_GET['file'];
        $safeName = basename($fileToDelete);
        
        // Determine full path based on location
        if (strpos($fileToDelete, 'data/') === 0) {
            $fullPath = "../" . $fileToDelete;
        } else {
            $fullPath = "../" . $fileToDelete;
        }
        
        if (file_exists($fullPath) && unlink($fullPath)) {
            echo "<div class='success'><h3>✅ File Deleted</h3><p>Successfully deleted: {$fileToDelete}</p></div>";
        } else {
            echo "<div class='error'><h3>❌ Delete Failed</h3><p>Could not delete: {$fileToDelete}</p></div>";
        }
        
        echo "<p><a href='?' class='btn btn-primary'>🔄 Refresh Analysis</a></p>";
    }
}

// Analyze current backup file situation
echo "<h3>📊 Current Backup File Analysis</h3>";

// Find all backup files
$correctFiles = glob("../data/cineshelf_backup_*.json");
$oldDataFiles = glob("../data/backup_*.json");
$oldRootFiles = glob("../backup_*.json");

$totalCorrect = count($correctFiles);
$totalOldData = count($oldDataFiles);
$totalOldRoot = count($oldRootFiles);
$totalOld = $totalOldData + $totalOldRoot;

echo "<div style='background:#f8f9fa;padding:15px;margin:10px 0;border-radius:5px;'>";
echo "<h4>📈 Summary</h4>";
echo "<p><strong class='success'>Correct Format:</strong> {$totalCorrect} files (data/cineshelf_backup_*.json)</p>";
echo "<p><strong class='warning'>Old Format:</strong> {$totalOld} files ({$totalOldData} in data/, {$totalOldRoot} in root)</p>";

if ($totalOld > 0) {
    echo "<p class='warning'><strong>⚠️ Action Required:</strong> Old format files may interfere with restore functionality.</p>";
} else {
    echo "<p class='success'><strong>✅ All Good:</strong> Only correct format files found.</p>";
}
echo "</div>";

// Show correct format files
if ($totalCorrect > 0) {
    echo "<h4 class='success'>✅ Correct Format Files (KEEP THESE)</h4>";
    echo "<table>";
    echo "<tr><th>Filename</th><th>Size</th><th>Modified</th><th>User</th></tr>";
    
    foreach ($correctFiles as $file) {
        $filename = basename($file);
        $size = round(filesize($file) / 1024, 1) . ' KB';
        $modified = date('Y-m-d H:i:s', filemtime($file));
        $user = str_replace(['cineshelf_backup_', '.json'], '', $filename);
        
        echo "<tr>";
        echo "<td class='success'>{$filename}</td>";
        echo "<td>{$size}</td>";
        echo "<td>{$modified}</td>";
        echo "<td><strong>{$user}</strong></td>";
        echo "</tr>";
    }
    echo "</table>";
}

// Show old format files that should be deleted
if ($totalOld > 0) {
    echo "<h4 class='warning'>⚠️ Old Format Files (SHOULD BE DELETED)</h4>";
    echo "<table>";
    echo "<tr><th>Location</th><th>Filename</th><th>Size</th><th>Modified</th><th>Actions</th></tr>";
    
    // Old files in data folder
    foreach ($oldDataFiles as $file) {
        $filename = basename($file);
        $size = round(filesize($file) / 1024, 1) . ' KB';
        $modified = date('Y-m-d H:i:s', filemtime($file));
        $relativePath = "data/" . $filename;
        
        echo "<tr>";
        echo "<td class='warning'>data/</td>";
        echo "<td class='warning'>{$filename}</td>";
        echo "<td>{$size}</td>";
        echo "<td>{$modified}</td>";
        echo "<td><a href='?action=delete_specific&file={$relativePath}' class='btn btn-danger' onclick='return confirm(\"Delete {$filename}?\")'>Delete</a></td>";
        echo "</tr>";
    }
    
    // Old files in root
    foreach ($oldRootFiles as $file) {
        $filename = basename($file);
        $size = round(filesize($file) / 1024, 1) . ' KB';
        $modified = date('Y-m-d H:i:s', filemtime($file));
        
        echo "<tr>";
        echo "<td class='warning'>root/</td>";
        echo "<td class='warning'>{$filename}</td>";
        echo "<td>{$size}</td>";
        echo "<td>{$modified}</td>";
        echo "<td><a href='?action=delete_specific&file={$filename}' class='btn btn-danger' onclick='return confirm(\"Delete {$filename}?\")'>Delete</a></td>";
        echo "</tr>";
    }
    echo "</table>";
    
    echo "<div style='margin:20px 0;'>";
    echo "<a href='?action=cleanup_all' class='btn btn-danger' onclick='return confirm(\"Delete ALL old format backup files? This cannot be undone!\")'>🗑️ Delete All Old Format Files</a>";
    echo "</div>";
}

// Show expected file structure
echo "<h3>📂 Expected File Structure</h3>";
echo "<pre>";
echo "/ (web root)\n";
echo "├── backup.php\n";
echo "├── restore.php\n"; 
echo "├── api/\n";
echo "│   ├── backup.php\n";
echo "│   └── restore.php\n";
echo "├── admin/\n";
echo "│   ├── debug-files.php\n";
echo "│   └── cleanup-backups.php (this file)\n";
echo "└── data/\n";
echo "    └── cineshelf_backup_*.json ✅ (ONLY these should exist)\n";
echo "\n";
echo "❌ DELETE THESE IF FOUND:\n";
echo "├── backup_*.json (in root)\n";
echo "└── data/backup_*.json (old format in data)\n";
echo "</pre>";

echo "<h3>🎯 How This Fixes Your Issue</h3>";
echo "<div style='background:#e7f3ff;padding:15px;margin:10px 0;border-radius:5px;'>";
echo "<p><strong>Your Problem:</strong> Backup saves to <code>data/cineshelf_backup_klindakoil.json</code> but restore finds <code>backup_klindakoil.json</code></p>";
echo "<p><strong>The Fix:</strong> Delete all old format files so restore only finds the correct format</p>";
echo "<p><strong>Result:</strong> Backup and restore will use the same file consistently</p>";
echo "</div>";

echo "<div style='margin-top:30px;'>";
echo "<p><a href='../admin/debug-files.php' class='btn btn-primary'>📋 Debug Files</a> ";
echo "<a href='../' class='btn btn-success'>🎬 Back to CineShelf</a></p>";
echo "</div>";

echo "</body></html>";
?>