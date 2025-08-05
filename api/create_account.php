<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
if (!isset($data['phone_number'], $data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

// Sanitize input
$phone_number = $conn->real_escape_string($data['phone_number']);
$password = password_hash($data['password'], PASSWORD_DEFAULT);

// Check if phone number already exists in MobileUsers table
$mobile_user_check = $conn->query("SELECT phone_number FROM MobileUsers WHERE phone_number = '$phone_number'");
if ($mobile_user_check && $mobile_user_check->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Phone number already registered']);
    exit;
}

// Check if phone number exists in Members table
$member_check = $conn->query("SELECT mid FROM Members WHERE phone_number = '$phone_number'");
$existing_member = ($member_check && $member_check->num_rows > 0);

if ($existing_member) {
    // Get the member ID
    $member_row = $member_check->fetch_assoc();
    $mid = $member_row['mid'];

    // Create mobile user account linked to existing member
    $sql = "INSERT INTO MobileUsers (phone_number, password, mid, is_verified) 
            VALUES ('$phone_number', '$password', $mid, FALSE)";
} else {
    // Create mobile user account without member link
    $sql = "INSERT INTO MobileUsers (phone_number, password, is_verified) 
            VALUES ('$phone_number', '$password', FALSE)";
}

if ($conn->query($sql)) {
    // Generate and store OTP (you'll implement this later)
    // For now, just return success with member status
    echo json_encode([
        'success' => true,
        'message' => 'Account created successfully',
        'existing_member' => $existing_member
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Account creation failed: ' . $conn->error]);
}

$conn->close();
