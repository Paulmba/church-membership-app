<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['phone_number'], $data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Missing fields']);
    exit;
}

$phone_number = $conn->real_escape_string($data['phone_number']);
$password = $data['password'];

// Find user by phone number with member details
$sql = "SELECT mu.password, mu.is_verified, mu.mid, m.profile_completed, m.first_name, m.last_name
        FROM MobileUsers mu 
        LEFT JOIN Members m ON mu.mid = m.mid 
        WHERE mu.phone_number = '$phone_number'";

$result = $conn->query($sql);

if (!$result || $result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Account not found']);
    exit;
}

$row = $result->fetch_assoc();

// Verify password
if (!password_verify($password, $row['password'])) {
    echo json_encode(['success' => false, 'message' => 'Incorrect password']);
    exit;
}

// Check if phone number is verified
if (!$row['is_verified']) {
    echo json_encode(['success' => false, 'message' => 'Please verify your phone number first']);
    exit;
}

// Check if user needs to complete registration
$needs_registration = !$row['profile_completed'];

echo json_encode([
    'success' => true,
    'needs_registration' => $needs_registration,
    'user_name' => $row['first_name'] . ' ' . $row['last_name']
]);

$conn->close();
