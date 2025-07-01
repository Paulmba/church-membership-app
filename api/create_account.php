<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require 'db.php';

// Check if sms_helper.php exists, if not create a basic sendSMS function
if (file_exists('sms_helper.php')) {
    require 'sms_helper.php';
} else {
    // Fallback function if sms_helper.php doesn't exist
    function sendSMS($phone_number, $message)
    {
        // Log the OTP for testing purposes
        error_log("SMS to $phone_number: $message");
        return true; // Always return true for testing
    }
}

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['phone_number'], $data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Missing fields']);
    exit;
}

$phone_number = $conn->real_escape_string($data['phone_number']);
$password = password_hash($data['password'], PASSWORD_BCRYPT);

// Validate phone number
if (empty($phone_number) || strlen($phone_number) < 9) {
    echo json_encode(['success' => false, 'message' => 'Invalid phone number']);
    exit;
}


// Check if account already exists
$check = $conn->query("SELECT * FROM MobileUsers WHERE phone_number = '$phone_number'");
if ($check && $check->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Account already exists']);
    exit;
}

// Insert into MobileUsers table (not verified yet)
$insert = "INSERT INTO MobileUsers (phone_number, password, is_verified) 
           VALUES ('$phone_number', '$password', FALSE)";

if ($conn->query($insert)) {
    // Generate OTP
    $otp_code = sprintf("%06d", mt_rand(100000, 999999));
    $expires_at = gmdate('Y-m-d H:i:s', strtotime('+5 minutes'));
    // Clean up old OTPs for this number
    $conn->query("DELETE FROM OTP WHERE phone_number = '$phone_number'");

    // Insert new OTP
    $otp_insert = "INSERT INTO OTP (phone_number, otp_code, expires_at) 
                   VALUES ('$phone_number', '$otp_code', '$expires_at')";

    if ($conn->query($otp_insert)) {
        // Try to send SMS
        $sms_sent = false;
        $sms_message = "Your Church App verification code is: $otp_code. Valid for 5 minutes.";

        try {
            $sms_sent = sendSMS($phone_number, $sms_message);
        } catch (Exception $e) {
            error_log("SMS sending failed: " . $e->getMessage());
            $sms_sent = false;
        }

        if ($sms_sent) {
            echo json_encode([
                'success' => true,
                'message' => 'Account created successfully. OTP sent to your phone.'
            ]);
        } else {
            // Even if SMS fails, account is created and OTP is in database
            echo json_encode([
                'success' => true,
                'message' => 'Account created. SMS service unavailable. Contact admin for OTP.',
                'otp_for_testing' => $otp_code // Remove this in production
            ]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to generate OTP: ' . $conn->error]);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Account creation failed: ' . $conn->error]);
}

$conn->close();
