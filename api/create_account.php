<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require 'db.php';
require 'push_notification_helper.php';

$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
if (!isset($data['phone_number'], $data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

// Sanitize input
$phone_number = $conn->real_escape_string($data['phone_number']);
$password = password_hash($data['password'], PASSWORD_DEFAULT);
$push_token = isset($data['push_token']) ? $conn->real_escape_string($data['push_token']) : null;

// Validate push token if provided
if ($push_token && !validatePushToken($push_token)) {
    echo json_encode(['success' => false, 'message' => 'Invalid push token format']);
    exit;
}

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
    $sql = "INSERT INTO MobileUsers (phone_number, password, mid, push_token, is_verified) 
            VALUES ('$phone_number', '$password', $mid, " . ($push_token ? "'$push_token'" : "NULL") . ", FALSE)";
} else {
    // Create mobile user account without member link
    $sql = "INSERT INTO MobileUsers (phone_number, password, push_token, is_verified) 
            VALUES ('$phone_number', '$password', " . ($push_token ? "'$push_token'" : "NULL") . ", FALSE)";
}

if ($conn->query($sql)) {
    // Generate and store OTP
    $otp_code = sprintf("%06d", mt_rand(100000, 999999));
    $expires_at = gmdate('Y-m-d H:i:s', strtotime('+5 minutes'));

    // Clean up old OTPs for this number
    $conn->query("DELETE FROM OTP WHERE phone_number = '$phone_number'");

    // Insert new OTP
    $otp_insert = "INSERT INTO OTP (phone_number, otp_code, expires_at) 
                   VALUES ('$phone_number', '$otp_code', '$expires_at')";

    if ($conn->query($otp_insert)) {
        $notification_sent = false;
        $notification_message = '';

        // Try to send push notification if token is available
        if ($push_token) {
            $push_result = sendOTPPushNotification($push_token, $otp_code, $phone_number);

            // Log the notification attempt
            $log_sql = "INSERT INTO PushNotificationLog (phone_number, push_token, notification_type, title, body, status) 
                        VALUES ('$phone_number', '$push_token', 'otp', 'Church App - Verification Code', 
                        'Your verification code is: $otp_code', '" . ($push_result['success'] ? 'sent' : 'failed') . "')";
            $conn->query($log_sql);

            if ($push_result['success']) {
                $notification_sent = true;
                $notification_message = 'Account created and OTP sent via push notification';
            } else {
                $notification_message = 'Account created but push notification failed';
            }
        } else {
            $notification_message = 'Account created. Push token not provided.';
        }

        echo json_encode([
            'success' => true,
            'message' => $notification_message,
            'existing_member' => $existing_member,
            'notification_sent' => $notification_sent,
            // Remove in production - only for testing
            'otp_for_testing' => $otp_code
        ]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to generate OTP']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Account creation failed: ' . $conn->error]);
}

$conn->close();
