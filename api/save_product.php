<?php
require 'db_connect.php';
require 'vendor/autoload.php';
use \Firebase\JWT\JWT;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://dev.fyvelondon.com');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

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
        if (empty($id)) {
            http_response_code(400);
            echo json_encode(['error' => 'Missing product ID']);
            exit;
        }
        $stmt = $conn->prepare("DELETE FROM products WHERE id = ?");
        $stmt->bind_param("s", $id);
        if ($stmt->execute()) {
            echo json_encode(['status' => 'success']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Failed to delete product']);
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
    $gallery = $_POST['gallery'];
}

$upload_dir = __DIR__ . '/../Uploads/';
if (!file_exists($upload_dir)) {
    mkdir($upload_dir, 0777, true);
}

if (isset($_FILES['new_gallery'])) {
    foreach ($_FILES['new_gallery']['tmp_name'] as $key => $tmp_name) {
        if ($_FILES['new_gallery']['error'][$key] === UPLOAD_ERR_OK) {
            $file_name = basename($_FILES['new_gallery']['name'][$key]);
            $target_file = $upload_dir . $file_name;
            if (move_uploaded_file($tmp_name, $target_file)) {
                $gallery[] = '/Uploads/' . $file_name;
            }
        }
    }
}

$gallery_json = json_encode($gallery);

if (empty($id) || empty($title)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing required fields']);
    exit;
}

$stmt = $conn->prepare("REPLACE INTO products (id, title, description, price, sku, gtin, product_type, stock_quantity, gallery, variations, categories, attributes, related_products) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->bind_param("sssdsdsiissss", $id, $title, $description, $price, $sku, $gtin, $product_type, $stock_quantity, $gallery_json, $variations, $categories, $attributes, $related_products);
if ($stmt->execute()) {
    echo json_encode(['status' => 'success']);
} else {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save product']);
}
$stmt->close();
?>