<?php
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

$attributes_file = __DIR__ . '/attributes.json';
if (!file_exists($attributes_file)) {
    file_put_contents($attributes_file, json_encode([])); // Initialize with empty array
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $attributes = json_decode(file_get_contents($attributes_file), true);
        echo json_encode($attributes);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            echo json_encode(['status' => 'error', 'message' => 'Invalid JSON']);
            exit;
        }

        $attributes = json_decode(file_get_contents($attributes_file), true);

        if (isset($input['attribute_name'])) {
            $new_id = (string)(count($attributes) + 1);
            $attributes[] = [
                'id' => $new_id,
                'name' => $input['attribute_name'],
                'terms' => $input['terms'] ?? []
            ];
            file_put_contents($attributes_file, json_encode($attributes));
            echo json_encode(['status' => 'success', 'id' => $new_id]);
        } elseif (isset($input['attribute_id'], $input['term_name'])) {
            $attr_id = $input['attribute_id'];
            $term_name = $input['term_name'];
            foreach ($attributes as &$attr) {
                if ($attr['id'] === $attr_id) {
                    $term_id = (string)(count($attr['terms']) + 1);
                    $attr['terms'][] = ['id' => $term_id, 'term_name' => $term_name];
                    break;
                }
            }
            file_put_contents($attributes_file, json_encode($attributes));
            echo json_encode(['status' => 'success', 'id' => $term_name]);
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

        if (!isset($input['attribute_id'])) {
            echo json_encode(['status' => 'error', 'message' => 'Attribute ID required']);
            exit;
        }

        $attributes = json_decode(file_get_contents($attributes_file), true);
        $attributes = array_filter($attributes, fn($attr) => $attr['id'] !== $input['attribute_id']);
        $attributes = array_values($attributes); // Reindex array
        file_put_contents($attributes_file, json_encode($attributes));
        echo json_encode(['status' => 'success']);
        break;
}
?>