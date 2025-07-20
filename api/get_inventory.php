<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://dev.fyvelondon.com');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once __DIR__ . '/sellercloud_auth.php';

$token = getSellercloudToken();
if (!$token) {
    echo json_encode(['error' => 'Failed to authenticate']);
    exit;
}

$sku = $_GET['sku'] ?? '';
if (!$sku) {
    echo json_encode(['error' => 'SKU required']);
    exit;
}

$url = "https://sgt.api.sellercloud.com/rest/api/Inventory/Details?productID=" . urlencode($sku);

$options = [
    'http' => [
        'header' => "Authorization: Bearer $token\r\nAccept: application/json\r\n",
        'method' => 'GET',
        'timeout' => 30
    ]
];

$context = stream_context_create($options);
$response = file_get_contents($url, false, $context);

if ($response === false) {
    echo json_encode(['error' => 'API request failed']);
    exit;
}

$data = json_decode($response, true);
$stock = $data['Inventory']['AggregateQty'] ?? 0;

echo json_encode(['raw_response' => $data, 'stock_quantity' => $stock]);
?>