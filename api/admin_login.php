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

$headers = getallheaders();
$token = str_replace('Bearer ', '', $headers['Authorization'] ?? '');

if ($token) {
    try {
        $decoded = JWT::decode($token, new \Firebase\JWT\Key($secret, 'HS256'));
        if ($decoded->role === 'admin') {
            $newPayload = [
                'user_id' => $decoded->user_id,
                'role' => $decoded->role,
                'exp' => time() + 3600
            ];
            $newToken = JWT::encode($newPayload, $secret, 'HS256');
            echo json_encode(['token' => $newToken, 'role' => $decoded->role]);
            exit;
        } else {
            http_response_code(401);
            echo json_encode(['error' => 'Admin access only']);
            exit;
        }
    } catch (Exception $e) {
        http_response_code(401);
        echo json_encode(['error' => 'Invalid token']);
        exit;
    }
}

$data = json_decode(file_get_contents('php://input'), true);
$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing email or password']);
    exit;
}

$stmt = $conn->prepare("SELECT id, username, password, role FROM users WHERE email = ? AND role = 'admin'");
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();
$user = $result->fetch_assoc();

if ($user && password_verify($password, $user['password'])) {
    $payload = ['user_id' => $user['id'], 'role' => $user['role'], 'exp' => time() + 3600];
    $jwt = JWT::encode($payload, $secret, 'HS256');
    echo json_encode(['token' => $jwt, 'role' => $user['role']]);
} else {
    http_response_code(401);
    echo json_encode(['error' => 'Invalid credentials']);
}
$stmt->close();
?>