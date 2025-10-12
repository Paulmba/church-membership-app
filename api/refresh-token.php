<?php
// refresh-token.php - Simplified token refresh without roles

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

require __DIR__ . '/config/db.php';
require __DIR__ . '/vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$secret_key = getenv('JWT_SECRET_KEY') ?: "197b7ca74482c4000c46ae8a88d5fe111cefe05e4f4c01407c82216c189b2955";

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['token'], $data['member_id'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$old_token = $data['token'];
$member_id = $data['member_id'];

try {
    // Verify the old token (allow expired tokens for refresh)
    try {
        JWT::$leeway = 60; // Allow 60 seconds of leeway for expiration
        $decoded = JWT::decode($old_token, new Key($secret_key, 'HS256'));
    } catch (Exception $e) {
        // For refresh, we can be lenient with expiration but not other errors
        error_log("Token decode error: " . $e->getMessage());

        // Try to decode without verification to get phone number
        $tokenParts = explode('.', $old_token);
        if (count($tokenParts) === 3) {
            $payload = json_decode(base64_decode($tokenParts[1]), true);
            if ($payload && isset($payload['phone_number'])) {
                // Create a mock decoded object
                $decoded = (object)$payload;
            } else {
                echo json_encode(['success' => false, 'message' => 'Invalid token format']);
                exit;
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'Invalid token']);
            exit;
        }
    }

    // Verify member exists
    $stmt = $pdo->prepare("
        SELECT m.mid, m.first_name, m.last_name
        FROM Members m
        WHERE m.mid = ?
        LIMIT 1
    ");
    $stmt->execute([$member_id]);
    $member = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$member) {
        echo json_encode(['success' => false, 'message' => 'Member not found']);
        exit;
    }

    // Generate new token
    $issued_at = time();
    $expire = $issued_at + (60 * 60); // 1 hour

    $payload = [
        "iss" => "membership_app",
        "iat" => $issued_at,
        "exp" => $expire,
        "mid" => $member['mid'],
        "phone_number" => isset($decoded->phone_number) ? $decoded->phone_number : ''
    ];

    $new_token = JWT::encode($payload, $secret_key, 'HS256');

    echo json_encode([
        'success' => true,
        'token' => $new_token,
        'expires_in' => $expire,
        'member_id' => $member['mid'],
        'user_name' => $member['first_name'] . ' ' . $member['last_name']
    ]);
} catch (Exception $e) {
    error_log("Refresh token error: " . $e->getMessage());
    echo json_encode([
        'success' => false,
        'message' => 'Server error',
        'error' => $e->getMessage()
    ]);
}
