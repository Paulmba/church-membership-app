<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require 'config/db.php';
require __DIR__ . '/vendor/autoload.php';

use Firebase\JWT\JWT;

$secret_key = getenv('JWT_SECRET_KEY') ?: "197b7ca74482c4000c46ae8a88d5fe111cefe05e4f4c01407c82216c189b2955";

$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
if (!isset($data['first_name'], $data['last_name'], $data['gender'], $data['dob'], $data['address'], $data['phone_number'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

// Sanitize input
$first_name = $conn->real_escape_string($data['first_name']);
$last_name = $conn->real_escape_string($data['last_name']);
$gender = $conn->real_escape_string($data['gender']);
$dob = $conn->real_escape_string($data['dob']);
$address = $conn->real_escape_string($data['address']);
$phone_number = $conn->real_escape_string($data['phone_number']);

// Check if user account exists and is verified
$user_check = $conn->query("SELECT * FROM MobileUsers WHERE phone_number = '$phone_number' AND is_verified = TRUE");
if (!$user_check || $user_check->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'User account not found or not verified']);
    exit;
}

// Check if member record already exists
$member_check = $conn->query("SELECT mid FROM Members WHERE phone_number = '$phone_number'");
if ($member_check && $member_check->num_rows > 0) {
    // Update existing member record
    $sql = "UPDATE Members SET 
            first_name = '$first_name', 
            last_name = '$last_name', 
            gender = '$gender', 
            dob = '$dob', 
            address = '$address',
            profile_completed = TRUE
            WHERE phone_number = '$phone_number'";
} else {
    // Insert new member record
    $sql = "INSERT INTO Members (first_name, last_name, gender, dob, address, phone_number, profile_completed) 
            VALUES ('$first_name', '$last_name', '$gender', '$dob', '$address', '$phone_number', TRUE)";
}

if ($conn->query($sql)) {
    // Get the member ID for linking
    if ($member_check && $member_check->num_rows > 0) {
        $mid = $member_check->fetch_assoc()['mid'];
    } else {
        $mid = $conn->insert_id;
    }

    // Update MobileUsers table with member ID
    $conn->query("UPDATE MobileUsers SET mid = $mid WHERE phone_number = '$phone_number'");

    // Generate JWT Token
    $issued_at = time();
    $expire = $issued_at + (60 * 60); // 1 hour
    $payload = [
        "iss" => "membership_app",
        "iat" => $issued_at,
        "exp" => $expire,
        "mid" => $mid,
        "phone_number" => $phone_number
    ];
    $jwt = JWT::encode($payload, $secret_key, 'HS256');

    echo json_encode([
        'success' => true, 
        'message' => 'Registration completed successfully',
        'token' => $jwt,
        'member_id' => $mid
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Registration failed: ' . $conn->error]);
}

$conn->close();
