<?php
// api/get_member_profile.php
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
    $stmt = $pdo->prepare("SELECT mid, first_name, last_name, gender, dob, address, phone_number, profile_photo_url, profile_completed FROM members WHERE mid = ?");
    $stmt->execute([$memberId]);
    $member = $stmt->fetch();

    if ($member) {
        echo json_encode(['success' => true, 'data' => $member]);
    } else {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Member not found']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error', 'error' => $e->getMessage()]);
}
