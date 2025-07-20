<?php
// manage_categories.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: http://localhost:3000');
header('Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/php_errors.log');

$categories_file = __DIR__ . '/categories.json';
if (!file_exists($categories_file)) {
    file_put_contents($categories_file, json_encode([])); // Initialize with empty array
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $categories = json_decode(file_get_contents($categories_file), true);
        echo json_encode($categories);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
            exit;
        }

        $categories = json_decode(file_get_contents($categories_file), true);

        if (isset($input['category_name'])) {
            $new_id = (string)(count($categories) + 1);
            $categories[] = [
                'id' => $new_id,
                'name' => $input['category_name'],
            ];
            file_put_contents($categories_file, json_encode($categories));
            echo json_encode(['status' => 'success', 'id' => $new_id]);
        } else {
            echo json_encode(['status' => 'error', 'message' => 'Invalid input']);
        }
        break;

    case 'DELETE':
        $input = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
            exit;
        }

        if (!isset($input['category_id'])) {
            echo json_encode(['status' => 'error', 'message' => 'Category ID required']);
            exit;
        }

        $categories = json_decode(file_get_contents($categories_file), true);
        $categories = array_filter($categories, fn($cat) => $cat['id'] !== $input['category_id']);
        $categories = array_values($categories); // Reindex array
        file_put_contents($categories_file, json_encode($categories));
        echo json_encode(['status' => 'success']);
        break;
}
?>