<?php
header('Content-Type: application/json');

function getSellercloudToken() {
    $cache_file = __DIR__ . '/sellercloud_token.json';
    $cache_duration = 3500; // Cache for 3500 seconds (just under 1 hour)

    // Check if cached token exists and is valid
    if (file_exists($cache_file)) {
        $cache_data = json_decode(file_get_contents($cache_file), true);
        if ($cache_data && isset($cache_data['access_token']) && $cache_data['expires_at'] > time()) {
            return $cache_data['access_token'];
        }
    }

    // Request new token
    $url = 'https://sgt.api.sellercloud.com/rest/api/token';
    $data = [
        'Username' => 'hello@fyvekids.com',
        'Password' => 'Fyvekids123456'
    ];

    $options = [
        'http' => [
            'header'  => "Content-Type: application/json\r\nAccept: application/json\r\n",
            'method'  => 'POST',
            'content' => json_encode($data),
            'timeout' => 30
        ]
    ];

    $context  = stream_context_create($options);
    $response = file_get_contents($url, false, $context);

    if ($response === false) {
        error_log("Failed to fetch Sellercloud token: " . print_r($http_response_header, true));
        return null;
    }

    $response_data = json_decode($response, true);
    if (!isset($response_data['access_token'])) {
        error_log("Invalid Sellercloud token response: " . $response);
        return null;
    }

    // Cache the token
    $cache_data = [
        'access_token' => $response_data['access_token'],
        'expires_at' => time() + $response_data['expires_in']
    ];
    file_put_contents($cache_file, json_encode($cache_data));

    return $response_data['access_token'];
}
?>