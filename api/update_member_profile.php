<?php
// api/update_member_profile.php - MySQLi version
header('Content-Type: application/json');

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/../middleware/JWTMiddleware.php';

$auth = new JWTMiddleware();
$auth->authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

$data = json_decode(file_get_contents("php://input"), true);

$memberId = isset($data['mid']) ? (int)$data['mid'] : 0;

if ($memberId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid member ID']);
    exit;
}

// Add validation for other fields as needed
$firstName = isset($data['first_name']) ? trim($data['first_name']) : '';
$lastName = isset($data['last_name']) ? trim($data['last_name']) : '';
$address = isset($data['address']) ? trim($data['address']) : '';

$stmt = $conn->prepare("UPDATE Members SET first_name = ?, last_name = ?, address = ? WHERE mid = ?");
if (!$stmt) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database prepare error', 'error' => $conn->error]);
    exit;
}

$stmt->bind_param("sssi", $firstName, $lastName, $address, $memberId);

if ($stmt->execute()) {
    echo json_encode(['success' => true, 'message' => 'Profile updated successfully']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Database error', 'error' => $stmt->error]);
}

$stmt->close();