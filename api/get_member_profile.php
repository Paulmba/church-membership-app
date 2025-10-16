<?php
// api/get_member_profile.php - MySQLi version
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

$memberId = isset($_GET['mid']) ? (int)$_GET['mid'] : 0;

if ($memberId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid member ID']);
    exit;
}

try {
    // Prepare and execute MySQLi statement
    $stmt = $conn->prepare("
        SELECT mid, first_name, last_name, gender, dob, address, phone_number, profile_photo_url, profile_completed
        FROM Members
        WHERE mid = ?
    ");
    $stmt->bind_param("i", $memberId);
    $stmt->execute();
    $result = $stmt->get_result();
    $member = $result->fetch_assoc();

    if ($member) {
        echo json_encode(['success' => true, 'data' => $member]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Member not found']);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error', 'error' => $e->getMessage()]);
}