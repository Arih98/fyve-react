<?php
error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

header('Access-Control-Allow-Origin: https://dev.fyvelondon.com');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

$host = "localhost";
$user = "ujragvggaplqc";
$password = "FyveLondon342!";
$database = "db1xzt4gbqudj5";

$conn = new mysqli($host, $user, $password, $database);

if ($conn->connect_error) {
    error_log("DB connection failed: " . $conn->connect_error);
    http_response_code(500);
    die(json_encode(["error" => "DB connection failed: " . $conn->connect_error]));
}

if (!$conn->select_db($database)) {
    error_log("DB selection failed: " . $conn->error);
    http_response_code(500);
    die(json_encode(["error" => "DB selection failed: " . $conn->error]));
}
?>