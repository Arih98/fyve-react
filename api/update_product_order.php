<?php
require 'db_connect.php';
require 'vendor/autoload.php';
use \Firebase\JWT\JWT;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://dev.fyvelondon.com');
header('Access-Control-Allow-Methods: POST');
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

    $data = json_decode(file_get_contents('php://input'), true);
    $orderData = $data['order'] ?? [];

    if (!is_array($orderData)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid order data']);
        exit;
    }

    $conn->begin_transaction();
    foreach ($orderData as $index => $productId) {
        $stmt = $conn->prepare("UPDATE products SET `order` = ? WHERE id = ?");
        $stmt->bind_param("is", $index, $productId);
        if (!$stmt->execute()) {
            $conn->rollback();
            http_response_code(500);
            echo json_encode(['error' => 'Failed to update order']);
            $stmt->close();
            exit;
        }
        $stmt->close();
    }
    $conn->commit();
    echo json_encode(['status' => 'success']);
} catch (Exception $e) {
    http_response_code(401);
    file_put_contents(__DIR__ . '/jwt_error.log', 'JWT Error: ' . $e->getMessage() . ' | Token: ' . $token . PHP_EOL, FILE_APPEND);
    echo json_encode(['error' => 'Invalid token']);
}
?>