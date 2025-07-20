<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$secret_key = 'sk_Sl0FWbYuo1lNBOXbdRQlSQ7_7byRXiTOv3mztPC8Q8XqQ68OS3YxG8MqbUpLapB6'; // Replace with your actual secret key from Revolut dashboard
$api_url = 'https://sandbox-merchant.revolut.com/api/orders'; // Use 'https://merchant.revolut.com/api/orders' for production

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($data['amount']) || !isset($data['currency'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing amount or currency']);
    exit;
}

// Build order payload (expand with customer details, billing/shipping as needed)
$order_payload = [
    'amount' => $data['amount'], // e.g., 2999 for 29.99
    'currency' => $data['currency'], // e.g., 'USD'
    // Optional: 'customer' => ['email' => $data['email'], 'name' => $data['name']],
    // 'billing_address' => [...], 'shipping_address' => [...],
    // 'capture_mode' => 'automatic',
];

$ch = curl_init($api_url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($order_payload));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Revolut-Api-Version: 2023-09-01', // Check latest in Revolut docs
    'Authorization: Bearer ' . $secret_key,
]);

$response = curl_exec($ch);
$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($http_code !== 201) {
    http_response_code($http_code);
    echo $response;
    exit;
}

$order = json_decode($response, true);
echo json_encode(['token' => $order['token']]); // Return the public token for frontend
?>