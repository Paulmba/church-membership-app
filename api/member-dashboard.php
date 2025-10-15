<?php
// member-dashboard-minimal.php - Absolute minimal version that should work

// Log requests for debugging
file_put_contents('member-dashboard-log.txt', "Request received at " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);
file_put_contents('member-dashboard-log.txt', "Request method: " . $_SERVER['REQUEST_METHOD'] . "\n", FILE_APPEND);
file_put_contents('member-dashboard-log.txt', "Query string: " . $_SERVER['QUERY_STRING'] . "\n", FILE_APPEND);

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Handle OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Include database
require_once __DIR__ . '/config/db.php';

// Get parameters
$action = isset($_GET['action']) ? $_GET['action'] : '';
$member_id = isset($_GET['member_id']) ? intval($_GET['member_id']) : null;
$method = $_SERVER['REQUEST_METHOD'];

// Response function
function sendResponse($success, $data = null, $message = '')
{
    echo json_encode([
        'success' => $success,
        'data' => $data,
        'message' => $message
    ]);
    exit;
}

// Validate member_id for GET requests
if ($method === 'GET' && !$member_id) {
    sendResponse(false, null, 'Member ID is required');
}

try {
    // GET REQUESTS
    if ($method === 'GET') {

        // Member Profile
        if ($action === 'member-profile') {
            $stmt = $pdo->prepare("SELECT mid, first_name, last_name FROM Members WHERE mid = ?");
            $stmt->execute([$member_id]);
            $member = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$member) {
                sendResponse(false, null, 'Member not found');
            }

            // Calculate age and demographic if dob exists
            $age = 25; // default
            $gender = 'M'; // default
            $demographic = 'youth';

            // Try to get dob and gender
            $detailStmt = $pdo->prepare("SELECT dob, gender FROM Members WHERE mid = ?");
            $detailStmt->execute([$member_id]);
            $details = $detailStmt->fetch(PDO::FETCH_ASSOC);

            if ($details && $details['dob']) {
                $dob = new DateTime($details['dob']);
                $now = new DateTime();
                $age = $now->diff($dob)->y;
                $gender = $details['gender'];

                // Determine demographic
                if ($age < 18) {
                    $demographic = 'children';
                } elseif ($age <= 35) {
                    $demographic = 'youth';
                } elseif ($gender === 'M' || $gender === 'male') {
                    $demographic = 'men';
                } elseif ($gender === 'F' || $gender === 'female') {
                    $demographic = 'women';
                } else {
                    $demographic = 'general';
                }
            }

            sendResponse(true, [
                'id' => $member['mid'],
                'name' => $member['first_name'] . ' ' . $member['last_name'],
                'role' => 'Member',
                'demographic' => $demographic,
                'profileImage' => null,
                'notifications' => 0,
                'age' => $age,
                'gender' => $gender
            ]);
        }

        // Announcements
        else if ($action === 'announcements') {
            $type = isset($_GET['type']) ? $_GET['type'] : 'general';

            // Get member demographic
            $demographic = 'general';
            try {
                $stmt = $pdo->prepare("SELECT dob, gender FROM Members WHERE phone_number = ?");
                $stmt->execute([$member_id]);
                $member = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($member && $member['dob']) {
                    $dob = new DateTime($member['dob']);
                    $now = new DateTime();
                    $age = $now->diff($dob)->y;
                    $gender = strtolower($member['gender']);

                    if ($age < 18) $demographic = 'children';
                    elseif ($age <= 35) $demographic = 'youth';
                    elseif ($gender === 'm' || $gender === 'male') $demographic = 'men';
                    elseif ($gender === 'f' || $gender === 'female') $demographic = 'women';
                }
            } catch (Exception $e) {
                // Use default demographic
            }

            // Build query based on tab
            $where = "expiry_date > NOW()";
            $params = [];

            if ($type === 'general') {
                // Show only general announcements
                $where .= " AND (type = 'general' OR type IS NULL OR target_demographic = 'all')";
            } elseif ($type === 'group') {
                // Show announcements for member's demographic group
                $where .= " AND (target_demographic = ? OR type = ?)";
                $params[] = $demographic;
                $params[] = $demographic;
            }

            $query = "SELECT 
                        id, 
                        title, 
                        content, 
                        COALESCE(type, 'general') as type,
                        COALESCE(is_urgent, 0) as is_urgent,
                        COALESCE(created_by, 'Admin') as author,
                        DATE_FORMAT(created_at, '%Y-%m-%d') as date
                      FROM announcements 
                      WHERE $where
                      ORDER BY is_urgent DESC, created_at DESC";

            $stmt = $pdo->prepare($query);
            $stmt->execute($params);

            $announcements = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $announcements[] = [
                    'id' => $row['id'],
                    'title' => $row['title'],
                    'content' => $row['content'],
                    'type' => $row['type'],
                    'author' => $row['author'],
                    'date' => $row['date'],
                    'isUrgent' => (bool)$row['is_urgent']
                ];
            }

            sendResponse(true, $announcements);
        } else {
            sendResponse(false, null, 'Invalid action');
        }
    }

    // POST REQUESTS
    else if ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);
        sendResponse(false, null, 'Invalid action');
    } else {
        sendResponse(false, null, 'Method not allowed');
    }
} catch (PDOException $e) {
    sendResponse(false, null, 'Database error: ' . $e->getMessage());
} catch (Exception $e) {
    sendResponse(false, null, 'Error: ' . $e->getMessage());
}
