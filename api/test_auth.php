<?php
require_once 'sellercloud_auth.php';
$token = getSellercloudToken();
echo json_encode(['token' => $token]);
?>