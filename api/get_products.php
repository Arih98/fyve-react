<?php
require 'db_connect.php';
require 'vendor/autoload.php';
use \Firebase\JWT\JWT;

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://dev.fyvelondon.com');
header('Access-Control-Allow-Methods: GET');
header('Access-Control-Allow-Headers: Authorization');

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
    $stmt = $conn->prepare("SELECT * FROM products ORDER BY `order` ASC");
    $stmt->execute();
    $result = $stmt->get_result();
    $products = $result->fetch_all(MYSQLI_ASSOC);
    echo json_encode($products);
} catch (Exception $e) {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid token']);
}
$stmt->close();
?>