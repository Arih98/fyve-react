<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://dev.fyvelondon.com');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

require_once 'sellercloud_auth.php';

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        // Get Sellercloud token
        $token = getSellercloudToken();
        if (!$token) {
            echo json_encode(['error' => 'Failed to authenticate with Sellercloud']);
            exit;
        }

        // Fetch orders with shipping/tracking data
        $url = 'https://sgt.api.sellercloud.com/rest/api/Orders?pageNumber=1&pageSize=50&companyID=312';

        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPGET, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            "Content-Type: application/json",
            "Authorization: Bearer $token"
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_HEADER, true);

        $response = curl_exec($ch);
        $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $headers = substr($response, 0, $header_size);
        $body = substr($response, $header_size);

        if ($response === false) {
            $error = curl_error($ch);
            error_log("Sellercloud API cURL error: $error");
            curl_close($ch);
            echo json_encode(["error" => "Failed to fetch shipping/tracking data: $error"]);
            exit;
        }

        curl_close($ch);

        if ($http_code !== 200) {
            error_log("Sellercloud API error: HTTP $http_code\nHeaders: $headers\nResponse: $body");
            echo json_encode(["error" => "Failed to fetch shipping/tracking data: HTTP $http_code - " . ($body ? $body : 'No response body')]);
            exit;
        }

        $response_data = json_decode($body, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log("Sellercloud API non-JSON response: $body");
            echo json_encode(["error" => "Failed to fetch shipping/tracking data: Invalid response format ($body)"]);
            exit;
        }

        // Map orders to shipping/tracking data
        $tracking_data = array_map(function($order) {
            return [
                'order_id' => $order['ID'] ?? $order['OrderID'],
                'status' => $order['Status'] ?? 'Unknown',
                'tracking_number' => $order['TrackingNumber'] ?? null,
                'carrier' => $order['CarrierName'] ?? null,
                'shipping_date' => $order['ShipDate'] ?? null,
                'items' => array_map(function($item) {
                    return [
                        'sku' => $item['ProductID'] ?? $item['SKU'],
                        'quantity' => intval($item['Qty'] ?? 0)
                    ];
                }, $order['Items'] ?? [])
            ];
        }, $response_data['Items'] ?? $response_data);

        echo json_encode($tracking_data);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
            exit;
        }
        if (!isset($input['order_id'], $input['items'], $input['customer_details'], $input['shipping_address'])) {
            echo json_encode(['status' => 'error', 'message' => 'Missing required fields']);
            exit;
        }
        $token = getSellercloudToken();
        if (!$token) {
            echo json_encode(['status' => 'error', 'message' => 'Failed to authenticate with Sellercloud']);
            exit;
        }
        $url = 'https://sgt.api.sellercloud.com/rest/api/Orders';
        $order_data = [
            'CustomerDetails' => [
                'Email'     => $input['customer_details']['email']      ?? '',
                'FirstName' => $input['customer_details']['first_name'] ?? '',
                'LastName'  => $input['customer_details']['last_name']  ?? ''
            ],
            'OrderDetails' => [
                'CompanyID'            => 312, // Replace with correct CompanyId if different
                'Channel'              => 6, // Website orders
                'OrderSourceOrderID'   => $input['order_id'],
                'OrderDate'            => date('c'),
                'DisableInventoryCount'=> true
            ],
            'Products' => array_map(function($item) {
                return [
                    'ProductID' => $item['sku'],
                    'Qty'       => intval($item['quantity'])
                ];
            }, $input['items']),
            'ShippingAddress' => [
                'FirstName' => $input['shipping_address']['first_name'] ?? '',
                'LastName'  => $input['shipping_address']['last_name']  ?? '',
                'Country'   => $input['shipping_address']['country']     ?? '',
                'City'      => $input['shipping_address']['city']        ?? '',
                'State'     => $input['shipping_address']['state']       ?? '',
                'ZipCode'   => $input['shipping_address']['zip']         ?? '',
                'Address'   => $input['shipping_address']['street1']     ?? '',
                'Address2'  => $input['shipping_address']['street2']     ?? ''
            ],
            'BillingAddress' => [
                'FirstName' => $input['shipping_address']['first_name'] ?? '',
                'LastName'  => $input['shipping_address']['last_name']  ?? '',
                'Country'   => $input['shipping_address']['country']     ?? '',
                'City'      => $input['shipping_address']['city']        ?? '',
                'State'     => $input['shipping_address']['state']       ?? '',
                'ZipCode'   => $input['shipping_address']['zip']         ?? '',
                'Address'   => $input['shipping_address']['street1']     ?? '',
                'Address2'  => $input['shipping_address']['street2']     ?? ''
            ]
        ];
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $token
        ]);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($order_data));
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);
        curl_setopt($ch, CURLOPT_HEADER, true);
        $response    = curl_exec($ch);
        $http_code   = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
        $body        = substr($response, $header_size);
        curl_close($ch);
        if ($http_code !== 200) {
            error_log("Sellercloud API error: HTTP $http_code\nResponse: $body");
            echo json_encode(['status' => 'error', 'message' => "Failed to create order: HTTP $http_code - " . ($body ?: 'No response body')]);
            exit;
        }
        $response_data = json_decode($body, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            echo json_encode(['status' => 'error', 'message' => "Failed to create order: Invalid response format ($body)"]);
            exit;
        }
        echo json_encode(['status' => 'success', 'order_id' => $response_data['ID'] ?? $input['order_id']]);
        break;

    default:
        echo json_encode(['error' => 'Unsupported method']);
}
?>