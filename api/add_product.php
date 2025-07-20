<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://dev.fyvelondon.com');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

$upload_dir = __DIR__ . '/Uploads/';
if (!is_dir($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

function upload_file($file) {
    if ($file['error'] !== UPLOAD_ERR_OK) {
        return null;
    }
    $filename = basename($file['name']);
    $target_path = $GLOBALS['upload_dir'] . $filename;
    if (move_uploaded_file($file['tmp_name'], $target_path)) {
        return '/api/Uploads/' . $filename;
    }
    return null;
}

$existing_gallery = json_decode($_POST['gallery'] ?? '[]', true);
$uploaded_gallery = [];
$max_index = count($existing_gallery) - 1;
if ($max_index < 0) $max_index = 0;
foreach ($_FILES as $key => $file) {
    if (strpos($key, 'gallery_image_') === 0) {
        $idx = (int)substr($key, 14);
        $path = upload_file($file);
        if ($path) {
            $uploaded_gallery[$idx] = $path;
            if ($idx > $max_index) $max_index = $idx;
        }
    }
}
$gallery_paths = [];
$existing_idx = 0;
for ($i = 0; $i <= $max_index; $i++) {
    if (isset($uploaded_gallery[$i])) {
        $gallery_paths[] = $uploaded_gallery[$i];
    } elseif ($existing_idx < count($existing_gallery)) {
        $gallery_paths[] = $existing_gallery[$existing_idx];
        $existing_idx++;
    }
}

$parent_result = [
    'gallery_paths' => $gallery_paths,
];

$var_results = [];
$variations_json = $_POST['variations'] ?? '[]';
$variations = json_decode($variations_json, true);
foreach ($variations as $j => $variation) {
    $existing_var_gallery = json_decode($_POST["variation_{$j}_gallery"] ?? '[]', true);
    $uploaded_var_gallery = [];
    $max_var_index = count($existing_var_gallery) - 1;
    if ($max_var_index < 0) $max_var_index = 0;
    foreach ($_FILES as $file_key => $file) {
        if (strpos($file_key, "variation_{$j}_gallery_") === 0) {
            $idx = (int)substr($file_key, strlen("variation_{$j}_gallery_"));
            $path = upload_file($file);
            if ($path) {
                $uploaded_var_gallery[$idx] = $path;
                if ($idx > $max_var_index) $max_var_index = $idx;
            }
        }
    }
    $var_gallery_paths = [];
    $existing_var_idx = 0;
    for ($i = 0; $i <= $max_var_index; $i++) {
        if (isset($uploaded_var_gallery[$i])) {
            $var_gallery_paths[] = $uploaded_var_gallery[$i];
        } elseif ($existing_var_idx < count($existing_var_gallery)) {
            $var_gallery_paths[] = $existing_var_gallery[$existing_var_idx];
            $existing_var_idx++;
        }
    }

    $var_results[] = [
        'gallery_paths' => $var_gallery_paths,
    ];
}

$results = array_merge([$parent_result], $var_results);
echo json_encode(['status' => 'success', 'results' => $results]);
?>