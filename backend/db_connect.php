<?php
// ~/Desktop/new-spa/api/db_connect.php

// Enable error logging
error_reporting(E_ALL);
ini_set('display_errors', 0); // Prevent HTML output
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

// CORS headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Database credentials
$host = "127.0.0.1";
$user = "root";
$password = "7050136";
$database = "ecommerce";

// Create connection
$conn = new mysqli($host, $user, $password, $database);

// Check connection
if ($conn->connect_error) {
    error_log("DB connection failed: " . $conn->connect_error);
    http_response_code(500);
    die(json_encode(["error" => "DB connection failed: " . $conn->connect_error]));
}

// Verify database selection
if (!$conn->select_db($database)) {
    error_log("DB selection failed: " . $conn->error);
    http_response_code(500);
    die(json_encode(["error" => "DB selection failed: " . $conn->error]));
}
?>