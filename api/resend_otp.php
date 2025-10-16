<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require 'config/db.php';
require 'push_notification_helper.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['phone_number'])) {
    echo json_encode(['success' => false, 'message' => 'Phone number required']);
    exit;
}

$phone_number = $conn->real_escape_string($data['phone_number']);

// Check if user exists and is not verified yet, and get push token
$check = $conn->query("SELECT push_token FROM MobileUsers WHERE phone_number = '$phone_number' AND is_verified = FALSE");
if (!$check || $check->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Account not found or already verified']);
    exit;
}

$user_row = $check->fetch_assoc();
$push_token = $user_row['push_token'];

// Check if too many recent attempts (optional security measure)
$recent_attempts = $conn->query("SELECT COUNT(*) as count FROM OTP WHERE phone_number = '$phone_number' AND created_at > DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 HOUR)");
if ($recent_attempts && $recent_attempts->fetch_assoc()['count'] >= 5) {
    echo json_encode(['success' => false, 'message' => 'Too many OTP requests. Please try again later.']);
    exit;
}

// Generate new OTP
$otp_code = sprintf("%06d", mt_rand(100000, 999999));
$expires_at = gmdate('Y-m-d H:i:s', strtotime('+5 minutes'));

// Clean up old OTPs for this number
$conn->query("DELETE FROM OTP WHERE phone_number = '$phone_number'");

// Insert new OTP
$insert = "INSERT INTO OTP (phone_number, otp_code, expires_at) 
           VALUES ('$phone_number', '$otp_code', '$expires_at')";

if ($conn->query($insert)) {
    $notification_sent = false;
    $response_message = '';

    if ($push_token) {
        // Send push notification
        $push_result = sendOTPPushNotification($push_token, $otp_code, $phone_number);

        // Log the notification attempt
        $log_sql = "INSERT INTO PushNotificationLog (phone_number, push_token, notification_type, title, body, status) 
                    VALUES ('$phone_number', '$push_token', 'otp_resend', 'Church App - Verification Code', 
                    'Your verification code is: $otp_code', '" . ($push_result['success'] ? 'sent' : 'failed') . "')";
        $conn->query($log_sql);

        if ($push_result['success']) {
            $notification_sent = true;
            $response_message = 'OTP resent via push notification';
        } else {
            $response_message = 'OTP generated but push notification failed';
        }
    } else {
        $response_message = 'OTP generated but no push token available';
    }

    echo json_encode([
        'success' => true,
        'message' => $response_message,
        'notification_sent' => $notification_sent,
        // Remove in production - only for testing
        'otp_for_testing' => $otp_code
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to generate OTP']);
}

$conn->close();
