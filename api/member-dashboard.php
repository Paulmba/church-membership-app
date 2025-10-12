<?php
// member-dashboard-minimal.php - Absolute minimal version that should work

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

            // Get member demographic first
            $demographic = 'general';
            try {
                $stmt = $pdo->prepare("SELECT dob, gender FROM Members WHERE mid = ?");
                $stmt->execute([$member_id]);
                $member = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($member && $member['dob']) {
                    $dob = new DateTime($member['dob']);
                    $now = new DateTime();
                    $age = $now->diff($dob)->y;
                    $gender = $member['gender'];

                    if ($age < 18) $demographic = 'children';
                    elseif ($age <= 35) $demographic = 'youth';
                    elseif ($gender === 'M' || $gender === 'male') $demographic = 'men';
                    elseif ($gender === 'F' || $gender === 'female') $demographic = 'women';
                }
            } catch (Exception $e) {
                // Use default demographic
            }

            // Build query
            $where = "expiry_date > NOW()";
            $params = [];

            if ($type === 'general') {
                $where .= " AND type = 'general'";
            } elseif ($type === 'group') {
                $where .= " AND type = ?";
                $params[] = $demographic;
            }

            $query = "SELECT id, title, content, type, is_urgent, created_at,
                             COALESCE((SELECT CONCAT(first_name, ' ', last_name) FROM Members WHERE mid = announcements.created_by), 'Admin') as author,
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
        }

        // Events
        else if ($action === 'events') {
            // Get member demographic
            $demographic = 'general';
            try {
                $stmt = $pdo->prepare("SELECT dob, gender FROM Members WHERE mid = ?");
                $stmt->execute([$member_id]);
                $member = $stmt->fetch(PDO::FETCH_ASSOC);

                if ($member && $member['dob']) {
                    $dob = new DateTime($member['dob']);
                    $now = new DateTime();
                    $age = $now->diff($dob)->y;
                    $gender = $member['gender'];

                    if ($age < 18) $demographic = 'children';
                    elseif ($age <= 35) $demographic = 'youth';
                    elseif ($gender === 'M' || $gender === 'male') $demographic = 'men';
                    elseif ($gender === 'F' || $gender === 'female') $demographic = 'women';
                }
            } catch (Exception $e) {
                // Use default
            }

            $query = "SELECT id, title, event_date, event_time, location, target_demographic,
                             (SELECT COUNT(*) FROM event_rsvp WHERE event_id = events.id AND status = 'attending') as attendees,
                             (SELECT COUNT(*) FROM event_rsvp WHERE event_id = events.id AND member_id = ? AND status = 'attending') as isAttending
                      FROM events
                      WHERE event_date >= CURDATE() AND (target_demographic = 'all' OR target_demographic = ?)
                      ORDER BY event_date ASC";

            $stmt = $pdo->prepare($query);
            $stmt->execute([$member_id, $demographic]);

            $events = [];
            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                $events[] = [
                    'id' => $row['id'],
                    'title' => $row['title'],
                    'date' => $row['event_date'],
                    'time' => date('g:i A', strtotime($row['event_time'])),
                    'location' => $row['location'],
                    'attendees' => (int)$row['attendees'],
                    'isAttending' => (bool)$row['isAttending'],
                    'demographic' => $row['target_demographic']
                ];
            }

            sendResponse(true, $events);
        } else {
            sendResponse(false, null, 'Invalid action');
        }
    }

    // POST REQUESTS
    else if ($method === 'POST') {
        $data = json_decode(file_get_contents("php://input"), true);

        // RSVP Event
        if ($action === 'rsvp-event') {
            $member_id = $data['member_id'] ?? null;
            $event_id = $data['event_id'] ?? null;
            $attending = $data['attending'] ?? false;

            if (!$member_id || !$event_id) {
                sendResponse(false, null, 'Member ID and Event ID required');
            }

            $status = $attending ? 'attending' : 'not_attending';

            // Check if exists
            $check = $pdo->prepare("SELECT id FROM event_rsvp WHERE event_id = ? AND member_id = ?");
            $check->execute([$event_id, $member_id]);

            if ($check->fetch()) {
                // Update
                $stmt = $pdo->prepare("UPDATE event_rsvp SET status = ?, updated_at = NOW() WHERE event_id = ? AND member_id = ?");
                $stmt->execute([$status, $event_id, $member_id]);
            } else {
                // Insert
                $stmt = $pdo->prepare("INSERT INTO event_rsvp (event_id, member_id, status) VALUES (?, ?, ?)");
                $stmt->execute([$event_id, $member_id, $status]);
            }

            sendResponse(true, null, 'RSVP updated successfully');
        } else {
            sendResponse(false, null, 'Invalid action');
        }
    } else {
        sendResponse(false, null, 'Method not allowed');
    }
} catch (PDOException $e) {
    sendResponse(false, null, 'Database error: ' . $e->getMessage());
} catch (Exception $e) {
    sendResponse(false, null, 'Error: ' . $e->getMessage());
}
