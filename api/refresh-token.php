<?php
// api/refresh-token.php - Token refresh endpoint

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
    echo json_encode(['success' => false, 'message' => 'Token and member ID required']);
    exit;
}

$token = $data['token'];
$member_id = $data['member_id'];

try {
    // Verify the current token (even if expired)
    try {
        $decoded = JWT::decode($token, new Key($secret_key, 'HS256'));
        $tokenData = (array)$decoded;
    } catch (Exception $e) {
        // Check if token is just expired (not malformed)
        $parts = explode('.', $token);
        if (count($parts) !== 3) {
            throw new Exception('Invalid token format');
        }

        // Decode payload without verification to check expiry
        $payload = json_decode(base64_decode($parts[1]), true);
        $currentTime = time();

        // Allow refresh if token expired less than 24 hours ago
        if (!isset($payload['exp']) || ($currentTime - $payload['exp']) > 86400) {
            throw new Exception('Token is too old to refresh');
        }

        $tokenData = $payload;
    }

    // Verify the member ID matches
    if ($tokenData['mid'] != $member_id) {
        echo json_encode(['success' => false, 'message' => 'Token mismatch']);
        exit;
    }

    // Get fresh user data including roles
    $stmt = $pdo->prepare("
        SELECT mu.mid, mu.phone_number, mu.is_verified,
               m.first_name, m.last_name, m.is_active,
               GROUP_CONCAT(DISTINCT lr.role_name) as roles,
               COUNT(DISTINCT ml.role_id) as role_count
        FROM MobileUsers mu
        LEFT JOIN Members m ON mu.mid = m.mid
        LEFT JOIN member_leadership ml ON m.mid = ml.member_id
        LEFT JOIN leadership_roles lr ON ml.role_id = lr.role_id
        WHERE mu.mid = ? AND mu.is_verified = 1 AND (m.is_active = 1 OR m.is_active IS NULL)
        GROUP BY mu.mid
        LIMIT 1
    ");
    $stmt->execute([$member_id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        echo json_encode(['success' => false, 'message' => 'User not found or inactive']);
        exit;
    }

    // Process role information
    $roles = $user['roles'] ? explode(',', $user['roles']) : [];
    $isLeader = $user['role_count'] > 0;
    $isPastor = $isLeader && in_array('Pastor', $roles);

    // Generate new JWT with fresh expiry
    $issued_at = time();
    $expire = $issued_at + (60 * 60); // 1 hour
    $payload = [
        "iss" => "membership_app",
        "iat" => $issued_at,
        "exp" => $expire,
        "mid" => $user['mid'],
        "phone_number" => $user['phone_number'],
        "roles" => $roles,
        "isLeader" => $isLeader,
        "isPastor" => $isPastor
    ];

    $newToken = JWT::encode($payload, $secret_key, 'HS256');

    // Update last login timestamp
    $updateStmt = $pdo->prepare("UPDATE members SET last_login = NOW() WHERE mid = ?");
    $updateStmt->execute([$member_id]);

    echo json_encode([
        'success' => true,
        'token' => $newToken,
        'expires_in' => $expire,
        'user_name' => $user['first_name'] . ' ' . $user['last_name'],
        'roles' => $roles,
        'isLeader' => $isLeader,
        'isPastor' => $isPastor
    ]);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Token refresh failed', 'error' => $e->getMessage()]);
}
