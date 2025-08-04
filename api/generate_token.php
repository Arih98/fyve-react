<?php
require 'vendor/autoload.php';
use \Firebase\JWT\JWT;

$secret = 'FyveLondonSecret2025!';
$payload = [
    'user_id' => 1,
    'role' => 'admin',
    'exp' => time() + (60 * 60 * 24) // valid for 24 hours
];

$jwt = JWT::encode($payload, $secret, 'HS256');
echo $jwt;
?>
