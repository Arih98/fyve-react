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

$secret_key = 'sk_H3C_Es27b5Pv-wfcLLEpPj0z1ZcmgGVVRgOJA7YuDDIVBkcLEqQPtg-_XL_SH7Ua'; // Replace with your actual secret key
$api_url = 'https://merchant.revolut.com/api/orders';

$data = json_decode(file_get_contents('php://input'), true);

error_log('Request Headers: ' . json_encode(getallheaders()));
error_log('Request Payload: ' . json_encode($data));

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

error_log('Order Payload: ' . json_encode($order_payload));
error_log('Authorization Header: Bearer ' . substr($secret_key, 0, 10) . '... (redacted)');

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

error_log('Revolut Response: HTTP ' . $http_code . ' - ' . $response);
error_log('cURL Info: ' . json_encode(curl_getinfo($ch)));

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