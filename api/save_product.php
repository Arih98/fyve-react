<?php
require 'db_connect.php';
require 'vendor/autoload.php';
use \Firebase\JWT\JWT;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://dev.fyvelondon.com');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

$secret = 'FyveLondonSecret2025!';

$headers = getallheaders();
$token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');

try {
    $decoded = JWT::decode($token, new \Firebase\JWT\Key($secret, 'HS256'));
    if ($decoded->role !== 'admin') {
        http_response_code(401);
        echo json_encode(['error' => 'Admin access only']);
        exit;
    }

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

    $id = $data['id'] ?? '';
    $title = $data['title'] ?? '';
    $description = $data['description'] ?? '';
    $price = $data['price'] ?? null;
    $sku = $data['sku'] ?? '';
    $gtin = $data['gtin'] ?? '';
    $product_type = $data['product_type'] ?? 'simple';
    $stock_quantity = $data['stock_quantity'] ?? 0;
    $gallery = $data['gallery'] ? json_encode($data['gallery']) : '';
    $variations = $data['variations'] ? json_encode($data['variations']) : '';
    $categories = $data['categories'] ? json_encode($data['categories']) : '';
    $attributes = $data['attributes'] ? json_encode($data['attributes']) : '';
    $related_products = $data['related_products'] ? json_encode($data['related_products']) : '';

    if (empty($id) || empty($title)) {
        http_response_code(400);
        echo json_encode(['error' => 'Missing required fields']);
        exit;
    }

    $stmt = $conn->prepare("REPLACE INTO products (id, title, description, price, sku, gtin, product_type, stock_quantity, gallery, variations, categories, attributes, related_products) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
    $stmt->bind_param("sssdsdsiissss", $id, $title, $description, $price, $sku, $gtin, $product_type, $stock_quantity, $gallery, $variations, $categories, $attributes, $related_products);
    if ($stmt->execute()) {
        echo json_encode(['status' => 'success']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save product']);
    }
    $stmt->close();
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid token']);
}
?>