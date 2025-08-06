<?php
require 'db_connect.php';
require 'vendor/autoload.php';
use \Firebase\JWT\JWT;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://dev.fyvelondon.com');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Cache-Control: no-cache, no-store, must-revalidate');
header('Pragma: no-cache');
header('Expires: 0');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$secret = 'FyveLondonSecret2025!';

$token = str_replace('Bearer ', '', $_SERVER['HTTP_AUTHORIZATION'] ?? '');
file_put_contents(__DIR__ . '/headers.log', json_encode(['Authorization' => $_SERVER['HTTP_AUTHORIZATION'] ?? 'none'], JSON_PRETTY_PRINT) . PHP_EOL, FILE_APPEND);

try {
    $decoded = JWT::decode($token, new \Firebase\JWT\Key($secret, 'HS256'));
    if ($decoded->role !== 'admin') {
        http_response_code(401);
        echo json_encode(['error' => 'Admin access only']);
        exit;
    }
} catch (Exception $e) {
    http_response_code(401);
    file_put_contents(__DIR__ . '/jwt_error.log', 'JWT Error: ' . $e->getMessage() . ' | Token: ' . $token . PHP_EOL, FILE_APPEND);
    echo json_encode(['error' => 'Invalid token']);
    exit;
}

// Check if it's a JSON payload (for delete) or FormData (for save)
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (strpos($contentType, 'application/json') !== false) {
    $data = json_decode(file_get_contents('php://input'), true);
    if (isset($data['delete']) && $data['delete'] === true) {
        $id = $data['id'] ?? '';
        file_put_contents(__DIR__ . '/delete_log.log', 'Delete attempt for ID: ' . $id . PHP_EOL, FILE_APPEND);

        if (empty($id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing product ID']);
            exit;
        }

        // Verify if product exists before deletion
        $checkStmt = $conn->prepare("SELECT id FROM products WHERE id = ?");
        $checkStmt->bind_param("s", $id);
        $checkStmt->execute();
        $checkResult = $checkStmt->get_result();
        $exists = $checkResult->num_rows > 0;
        $checkStmt->close();
        file_put_contents(__DIR__ . '/delete_log.log', 'Product exists check for ID ' . $id . ': ' . ($exists ? 'Found' : 'Not Found') . PHP_EOL, FILE_APPEND);

        if (!$exists) {
            http_response_code(404);
            echo json_encode(['error' => 'Product not found']);
            exit;
        }

        $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
        $stmt->bind_param("s", $id);
        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                file_put_contents(__DIR__ . '/delete_log.log', 'Successfully deleted product ID: ' . $id . PHP_EOL, FILE_APPEND);
                echo json_encode(['status' => 'success']);
            } else {
                file_put_contents(__DIR__ . '/delete_log.log', 'No rows affected for ID: ' . $id . PHP_EOL, FILE_APPEND);
                http_response_code(404);
                echo json_encode(['error' => 'Product not found or already deleted']);
            }
        } else {
            file_put_contents(__DIR__ . '/delete_log.log', 'Delete query failed for ID: ' . $id . ' - Error: ' . $stmt->error . PHP_EOL, FILE_APPEND);
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete product: ' . $stmt->error]);
        }
        $stmt->close();
        exit;
    }
}

// Handle FormData for product save
$id = $_POST['id'] ?? '';
$title = $_POST['title'] ?? '';
$description = $_POST['description'] ?? '';
$price = $_POST['price'] ?? null;
$sku = $_POST['sku'] ?? '';
$gtin = $_POST['gtin'] ?? '';
$product_type = $_POST['product_type'] ?? 'simple';
$stock_quantity = $_POST['stock_quantity'] ?? 0;
$variations = $_POST['variations'] ?? '[]';
$categories = $_POST['categories'] ?? '[]';
$attributes = $_POST['attributes'] ?? '[]';
$related_products = $_POST['related_products'] ?? '[]';

$gallery = [];
if (isset($_POST['gallery']) && is_array($_POST['gallery'])) {
    $gallery = array_filter($_POST['gallery'], 'is_string');
    file_put_contents(__DIR__ . '/save_log.log', 'Existing gallery URLs: ' . json_encode($gallery) . PHP_EOL, FILE_APPEND);
}

$upload_dir = __DIR__ . '/../Uploads/';
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
    file_put_contents(__DIR__ . '/save_log.log', 'Created upload directory: ' . $upload_dir . PHP_EOL, FILE_APPEND);
}

if (isset($_FILES['new_gallery']) && !empty($_FILES['new_gallery']['tmp_name'])) {
    file_put_contents(__DIR__ . '/save_log.log', 'New product gallery files received: ' . json_encode($_FILES['new_gallery']) . PHP_EOL, FILE_APPEND);
    foreach ($_FILES['new_gallery']['tmp_name'] as $key => $tmp_name) {
        if ($_FILES['new_gallery']['error'][$key] === UPLOAD_ERR_OK) {
            $file_name = time() . '_' . basename($_FILES['new_gallery']['name'][$key]);
            $target_file = $upload_dir . $file_name;
            if (move_uploaded_file($tmp_name, $target_file)) {
                $gallery[] = '/Uploads/' . $file_name;
                file_put_contents(__DIR__ . '/save_log.log', 'Uploaded product file: ' . $target_file . PHP_EOL, FILE_APPEND);
            } else {
                file_put_contents(__DIR__ . '/save_log.log', 'Failed to move product file: ' . $file_name . PHP_EOL, FILE_APPEND);
            }
        } else {
            file_put_contents(__DIR__ . '/save_log.log', 'Upload error for product file ' . $key . ': ' . $_FILES['new_gallery']['error'][$key] . PHP_EOL, FILE_APPEND);
        }
    }
}

// Process variation gallery files
$variations_data = json_decode($variations, true) ?? [];
if (!empty($_FILES['variations'])) {
    file_put_contents(__DIR__ . '/save_log.log', 'Variation files received: ' . json_encode($_FILES['variations']) . PHP_EOL, FILE_APPEND);
    foreach ($_FILES['variations'] as $varIndex => $variation_files) {
        if (isset($variation_files['gallery'])) {
            $variation_gallery = $variations_data[$varIndex]['gallery'] ?? [];
            foreach ($variation_files['gallery']['tmp_name'] as $fileIndex => $tmp_name) {
                if ($variation_files['gallery']['error'][$fileIndex] === UPLOAD_ERR_OK) {
                    $file_name = time() . '_' . basename($variation_files['gallery']['name'][$fileIndex]);
                    $target_file = $upload_dir . $file_name;
                    if (move_uploaded_file($tmp_name, $target_file)) {
                        $variation_gallery[] = '/Uploads/' . $file_name;
                        file_put_contents(__DIR__ . '/save_log.log', 'Uploaded variation file: ' . $target_file . ' for variation index ' . $varIndex . PHP_EOL, FILE_APPEND);
                    } else {
                        file_put_contents(__DIR__ . '/save_log.log', 'Failed to move variation file: ' . $file_name . ' for variation index ' . $varIndex . PHP_EOL, FILE_APPEND);
                    }
                } else {
                    file_put_contents(__DIR__ . '/save_log.log', 'Upload error for variation file ' . $fileIndex . ' in variation ' . $varIndex . ': ' . $variation_files['gallery']['error'][$fileIndex] . PHP_EOL, FILE_APPEND);
                }
            }
            $variations_data[$varIndex]['gallery'] = $variation_gallery;
        }
    }
}
$variations = json_encode($variations_data);

$gallery_json = json_encode($gallery);
file_put_contents(__DIR__ . '/save_log.log', 'Saving gallery JSON: ' . $gallery_json . ' for product ID: ' . $id . PHP_EOL, FILE_APPEND);
file_put_contents(__DIR__ . '/save_log.log', 'Saving variations JSON: ' . $variations . ' for product ID: ' . $id . PHP_EOL, FILE_APPEND);

if (empty($id) || empty($title)) {
    http_response_code(400);
    file_put_contents(__DIR__ . '/save_log.log', 'Missing required fields: id=' . $id . ', title=' . $title . PHP_EOL, FILE_APPEND);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$stmt = $conn->prepare("REPLACE INTO products (id, title, description, price, sku, gtin, product_type, stock_quantity, gallery, variations, categories, attributes, related_products) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sssdsdsiissss", $id, $title, $description, $price, $sku, $gtin, $product_type, $stock_quantity, $gallery_json, $variations, $categories, $attributes, $related_products);
if ($stmt->execute()) {
    file_put_contents(__DIR__ . '/save_log.log', 'Successfully saved product ID: ' . $id . PHP_EOL, FILE_APPEND);
    echo json_encode(['status' => 'success']);
} else {
    file_put_contents(__DIR__ . '/save_log.log', 'Save query failed for ID: ' . $id . ' - Error: ' . $stmt->error . PHP_EOL, FILE_APPEND);
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save product: ' . $stmt->error]);
}
$stmt->close();
?>