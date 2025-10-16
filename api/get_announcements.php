<?php
// api/get_announcements.php - MySQLi version
header('Content-Type: application/json');

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/../middleware/JWTMiddleware.php';

$auth = new JWTMiddleware();
$auth->authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

try {
    // Prepare and execute query using MySQLi
    $query = "SELECT 
                id, title, content, image_url, type, is_urgent, created_by, 
                target_demographic, expiry_date, created_at 
              FROM announcements 
              ORDER BY created_at DESC";
    $stmt = $conn->prepare($query);
    $stmt->execute();
    $result = $stmt->get_result();

    $announcements = [];
    while ($row = $result->fetch_assoc()) {
        $announcements[] = $row;
    }

    echo json_encode(['success' => true, 'data' => $announcements]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error', 'error' => $e->getMessage()]);
}