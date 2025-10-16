<?php
// api/verify_otp.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require 'config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['phone_number'], $data['otp_code'])) {
    echo json_encode(['success' => false, 'message' => 'Missing fields']);
    exit;
}

$phone_number = $conn->real_escape_string($data['phone_number']);
$otp_code = $conn->real_escape_string($data['otp_code']);
error_log("=== OTP Verification Debug ===");
error_log("Received phone: '" . $phone_number . "'");
error_log("Received OTP: '" . $otp_code . "'");
error_log("OTP length: " . strlen($otp_code));

// Check what's in the database
$debug_sql = "SELECT otp_code, phone_number, expires_at, is_verified, created_at FROM OTP WHERE phone_number = '$phone_number' ORDER BY created_at DESC LIMIT 1";
$debug_result = $conn->query($debug_sql);

if ($debug_result && $debug_result->num_rows > 0) {
    $row = $debug_result->fetch_assoc();
    error_log("DB phone: '" . $row['phone_number'] . "'");
    error_log("DB OTP: '" . $row['otp_code'] . "'");
    error_log("DB OTP length: " . strlen($row['otp_code']));
    error_log("Expires at: " . $row['expires_at']);
    error_log("Is verified: " . $row['is_verified']);
    error_log("Current time: " . gmdate('Y-m-d H:i:s'));

    // Direct comparison test
    if ($row['otp_code'] === $otp_code) {
        error_log("OTP codes match exactly");
    } else {
        error_log("OTP codes DO NOT match");
    }
} else {
    error_log("No OTP found in database for this phone number");
}

// Check if OTP exists and is valid
$sql = "SELECT * FROM OTP WHERE phone_number = '$phone_number' AND otp_code = '$otp_code' 
    AND expires_at > UTC_TIMESTAMP() AND is_verified = FALSE";
$result = $conn->query($sql);

if (!$result || $result->num_rows === 0) {
    // Increment attempts for security
    $conn->query("UPDATE OTP SET attempts = attempts + 1 WHERE phone_number = '$phone_number' AND expires_at > UTC_TIMESTAMP()");
    echo json_encode(['success' => false, 'message' => 'Invalid or expired OTP']);
    exit;
}

// Mark OTP as verified
$conn->query("UPDATE OTP SET is_verified = TRUE WHERE phone_number = '$phone_number' AND otp_code = '$otp_code'");

// Mark user as verified
$conn->query("UPDATE MobileUsers SET is_verified = TRUE WHERE phone_number = '$phone_number'");

echo json_encode(['success' => true, 'message' => 'Phone number verified successfully']);
$conn->close();
