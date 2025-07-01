<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require 'db.php';

// Include SMS helper with fallback
if (file_exists('sms_helper.php')) {
    require 'sms_helper.php';
} else {
    function sendSMS($phone_number, $message)
    {
        error_log("SMS to $phone_number: $message");
        return true;
    }
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['phone_number'])) {
    echo json_encode(['success' => false, 'message' => 'Phone number required']);
    exit;
}

$phone_number = $conn->real_escape_string($data['phone_number']);

// Check if user exists and is not verified yet
$check = $conn->query("SELECT * FROM MobileUsers WHERE phone_number = '$phone_number' AND is_verified = FALSE");
if (!$check || $check->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Account not found or already verified']);
    exit;
}

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
    $sms_message = "Your Church App verification code is: $otp_code. Valid for 5 minutes.";

    try {
        $sms_sent = sendSMS($phone_number, $sms_message);
        if ($sms_sent) {
            echo json_encode(['success' => true, 'message' => 'OTP sent successfully']);
        } else {
            echo json_encode([
                'success' => true,
                'message' => 'OTP generated but SMS failed',
                'otp_for_testing' => $otp_code // Remove in production
            ]);
        }
    } catch (Exception $e) {
        echo json_encode([
            'success' => true,
            'message' => 'OTP generated but SMS service unavailable',
            'otp_for_testing' => $otp_code // Remove in production
        ]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Failed to generate OTP']);
}

$conn->close();
