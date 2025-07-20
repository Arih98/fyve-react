<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://dev.fyvelondon.com');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

$secret_key = 'your_production_secret_key_here'; // Replace with your Revolut production secret key
$api_url = 'https://merchant.revolut.com/api/orders';

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['amount']) || !isset($data['currency'])) {
    error_log('Missing amount or currency in request');
    http_response_code(400);
    echo json_encode(['error' => 'Missing amount or currency']);
    exit;
}

$order_payload = [
    'amount' => $data['amount'],
    'currency' => $data['currency'],
];

$ch = curl_init($api_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($order_payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Revolut-Api-Version: 2023-09-01',
    'Authorization: Bearer ' . $secret_key,
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curl_error = curl_error($ch);
curl_close($ch);

if ($curl_error) {
    error_log('cURL error: ' . $curl_error);
    http_response_code(500);
    echo json_encode(['error' => 'cURL error: ' . $curl_error]);
    exit;
}

if ($http_code !== 201) {
    error_log('Revolut API error: HTTP ' . $http_code . ' - ' . $response);
    http_response_code($http_code);
    echo $response;
    exit;
}

$order = json_decode($response, true);
echo json_encode(['token' => $order['token']]);
?>