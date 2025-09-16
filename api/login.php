<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require __DIR__ . '/db.php';
require __DIR__ . '/vendor/autoload.php';

use Firebase\JWT\JWT;

// It's recommended to store your secret key in an environment variable for better security
// Example: putenv('JWT_SECRET_KEY=your_very_secret_key');
$secret_key = getenv('JWT_SECRET_KEY') ?: "197b7ca74482c4000c46ae8a88d5fe111cefe05e4f4c01407c82216c189b2955"; // fallback for development

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['phone_number'], $data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Missing fields']);
    exit;
}

$phone_number = $conn->real_escape_string($data['phone_number']);
$password = $data['password'];

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

$has_member_record = !is_null($row['mid']);
$needs_registration = !$has_member_record;

// JWT payload
$issued_at   = time();
$expire      = $issued_at + (60 * 60); // 1 hour
$payload = [
    "iss" => "membership_app",
    "iat" => $issued_at,
    "exp" => $expire,
    "data" => [
        "mid" => $row['mid'],
        "phone_number" => $phone_number
    ]
];

// Generate JWT
$jwt = JWT::encode($payload, $secret_key, 'HS256');

// Response
echo json_encode([
    'success' => true,
    'token' => $jwt,
    'expires_in' => $expire,
    'needs_registration' => $needs_registration,
    'user_name' => $has_member_record ? $row['first_name'] . ' ' . $row['last_name'] : null,
    'has_member_record' => $has_member_record,
    'member_id' => $row['mid']
]);

$conn->close();
