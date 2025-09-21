<?php
// api/member-dashboard.php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Include database connection
require_once 'config/db.php';

// Create database connection
if (!$pdo) {
    http_response_code(503);
    echo json_encode([
        'success' => false,
        'message' => 'Database connection failed'
    ]);
    exit();
}

$method = $_SERVER['REQUEST_METHOD'];
$action = isset($_GET['action']) ? $_GET['action'] : '';

switch ($method) {
    case 'GET':
        handleGetRequest($db, $action);
        break;
    case 'POST':
        handlePostRequest($db, $action);
        break;
    default:
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Method not allowed']);
        break;
}

function handleGetRequest($db, $action)
{
    switch ($action) {
        case 'member-profile':
            getMemberProfile($db);
            break;
        case 'announcements':
            getAnnouncements($db);
            break;
        case 'events':
            getEvents($db);
            break;
        case 'prayer-requests':
            getPrayerRequests($db);
            break;
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
            break;
    }
}

function handlePostRequest($db, $action)
{
    switch ($action) {
        case 'create-announcement':
            createAnnouncement($db);
            break;
        case 'rsvp-event':
            rsvpEvent($db);
            break;
        case 'create-prayer-request':
            createPrayerRequest($db);
            break;
        default:
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Invalid action']);
            break;
    }
}

function getMemberProfile($db)
{
    $member_id = isset($_GET['member_id']) ? $_GET['member_id'] : null;

    if (!$member_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Member ID is required']);
        return;
    }

    try {
        // Get member basic info with leadership roles
        $memberQuery = "SELECT m.*, 
                              TIMESTAMPDIFF(YEAR, m.dob, CURDATE()) as age,
                              GROUP_CONCAT(DISTINCT lr.role_name) as roles
                       FROM members m
                       LEFT JOIN member_leadership ml ON m.mid = ml.member_id
                       LEFT JOIN leadership_roles lr ON ml.role_id = lr.role_id
                       WHERE m.mid = :member_id
                       GROUP BY m.mid";

        $stmt = $db->prepare($memberQuery);
        $stmt->bindParam(':member_id', $member_id, PDO::PARAM_INT);
        $stmt->execute();
        $member = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$member) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Member not found']);
            return;
        }

        // Determine demographic based on age and gender
        $demographic = getDemographic($member['age'], $member['gender']);

        // Check if member is a leader
        $isLeader = !empty($member['roles']);
        $isPastor = $isLeader && strpos(strtolower($member['roles'] ?? ''), 'pastor') !== false;

        // Get notification count (unread announcements)
        $notificationQuery = "SELECT COUNT(*) as count FROM announcements 
                             WHERE created_at > COALESCE(
                                 (SELECT last_login FROM members WHERE mid = :member_id), 
                                 DATE_SUB(NOW(), INTERVAL 7 DAY)
                             ) 
                             AND expiry_date > NOW()";
        $notifStmt = $db->prepare($notificationQuery);
        $notifStmt->bindParam(':member_id', $member_id, PDO::PARAM_INT);
        $notifStmt->execute();
        $notifications = $notifStmt->fetch(PDO::FETCH_ASSOC);

        $memberData = [
            'id' => $member['mid'],
            'name' => $member['first_name'] . ' ' . $member['last_name'],
            'role' => $member['roles'] ?: 'Member',
            'demographic' => $demographic,
            'profileImage' => null, // Add profile image handling if needed
            'isLeader' => $isLeader,
            'isPastor' => $isPastor,
            'notifications' => $notifications['count'] ?? 0,
            'age' => $member['age'],
            'gender' => $member['gender']
        ];

        http_response_code(200);
        echo json_encode(['success' => true, 'data' => $memberData]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    }
}

function getAnnouncements($db)
{
    $member_id = isset($_GET['member_id']) ? $_GET['member_id'] : null;
    $type = isset($_GET['type']) ? $_GET['type'] : 'general';

    if (!$member_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Member ID is required']);
        return;
    }

    try {
        // Get member info to determine demographic
        $memberQuery = "SELECT *, TIMESTAMPDIFF(YEAR, dob, CURDATE()) as age FROM members WHERE mid = :member_id";
        $memberStmt = $db->prepare($memberQuery);
        $memberStmt->bindParam(':member_id', $member_id, PDO::PARAM_INT);
        $memberStmt->execute();
        $member = $memberStmt->fetch(PDO::FETCH_ASSOC);

        if (!$member) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Member not found']);
            return;
        }

        $demographic = getDemographic($member['age'], $member['gender']);

        // Build query based on type
        $whereConditions = ["a.expiry_date > NOW()"];
        $params = [':member_id' => $member_id];

        if ($type === 'general') {
            $whereConditions[] = "a.type = 'general'";
        } elseif ($type === 'group') {
            $whereConditions[] = "a.type = :demographic";
            $params[':demographic'] = $demographic;
        } elseif ($type === 'leadership') {
            $whereConditions[] = "a.type = 'leadership'";
            // Check if member is a leader
            $leaderCheck = "SELECT COUNT(*) as count FROM member_leadership WHERE member_id = :member_id";
            $leaderStmt = $db->prepare($leaderCheck);
            $leaderStmt->bindParam(':member_id', $member_id, PDO::PARAM_INT);
            $leaderStmt->execute();
            $isLeader = $leaderStmt->fetch(PDO::FETCH_ASSOC)['count'] > 0;

            if (!$isLeader) {
                http_response_code(200);
                echo json_encode(['success' => true, 'data' => []]);
                return;
            }
        }

        $whereClause = implode(' AND ', $whereConditions);

        $query = "SELECT a.*, 
                         CASE 
                           WHEN a.created_by IS NOT NULL 
                           THEN CONCAT(m.first_name, ' ', m.last_name)
                           ELSE 'Admin' 
                         END as author,
                         DATE_FORMAT(a.created_at, '%Y-%m-%d') as date
                  FROM announcements a
                  LEFT JOIN members m ON a.created_by = m.mid
                  WHERE $whereClause
                  ORDER BY a.is_urgent DESC, a.created_at DESC";

        $stmt = $db->prepare($query);
        foreach ($params as $param => $value) {
            $stmt->bindValue($param, $value);
        }
        $stmt->execute();

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

        http_response_code(200);
        echo json_encode(['success' => true, 'data' => $announcements]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    }
}

function getEvents($db)
{
    $member_id = isset($_GET['member_id']) ? $_GET['member_id'] : null;

    if (!$member_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Member ID is required']);
        return;
    }

    try {
        // Get member demographic
        $memberQuery = "SELECT *, TIMESTAMPDIFF(YEAR, dob, CURDATE()) as age FROM members WHERE mid = :member_id";
        $memberStmt = $db->prepare($memberQuery);
        $memberStmt->bindParam(':member_id', $member_id, PDO::PARAM_INT);
        $memberStmt->execute();
        $member = $memberStmt->fetch(PDO::FETCH_ASSOC);

        if (!$member) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Member not found']);
            return;
        }

        $demographic = getDemographic($member['age'], $member['gender']);

        $query = "SELECT e.*,
                         (SELECT COUNT(*) FROM event_rsvp WHERE event_id = e.id AND status = 'attending') as attendees,
                         (SELECT COUNT(*) FROM event_rsvp WHERE event_id = e.id AND member_id = :member_id AND status = 'attending') as isAttending
                  FROM events e
                  WHERE e.event_date >= CURDATE() 
                    AND (e.target_demographic = 'all' OR e.target_demographic = :demographic)
                  ORDER BY e.event_date ASC";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':member_id', $member_id, PDO::PARAM_INT);
        $stmt->bindParam(':demographic', $demographic);
        $stmt->execute();

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

        http_response_code(200);
        echo json_encode(['success' => true, 'data' => $events]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    }
}

function createAnnouncement($db)
{
    $data = json_decode(file_get_contents("php://input"), true);

    $member_id = $data['member_id'] ?? null;
    $title = trim($data['title'] ?? '');
    $content = trim($data['content'] ?? '');
    $type = $data['type'] ?? 'general';
    $is_urgent = $data['is_urgent'] ?? false;
    $expiry_date = $data['expiry_date'] ?? date('Y-m-d', strtotime('+30 days'));

    if (!$member_id || !$title || !$content) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Member ID, title, and content are required']);
        return;
    }

    try {
        // Check if member is a leader
        $leaderCheck = "SELECT COUNT(*) as count FROM member_leadership WHERE member_id = :member_id";
        $leaderStmt = $db->prepare($leaderCheck);
        $leaderStmt->bindParam(':member_id', $member_id, PDO::PARAM_INT);
        $leaderStmt->execute();
        $isLeader = $leaderStmt->fetch(PDO::FETCH_ASSOC)['count'] > 0;

        if (!$isLeader) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'Only leaders can create announcements']);
            return;
        }

        $query = "INSERT INTO announcements (title, content, type, is_urgent, expiry_date, created_by) 
                  VALUES (:title, :content, :type, :is_urgent, :expiry_date, :created_by)";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':content', $content);
        $stmt->bindParam(':type', $type);
        $stmt->bindParam(':is_urgent', $is_urgent, PDO::PARAM_BOOL);
        $stmt->bindParam(':expiry_date', $expiry_date);
        $stmt->bindParam(':created_by', $member_id, PDO::PARAM_INT);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(['success' => true, 'message' => 'Announcement created successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to create announcement']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    }
}

function rsvpEvent($db)
{
    $data = json_decode(file_get_contents("php://input"), true);

    $member_id = $data['member_id'] ?? null;
    $event_id = $data['event_id'] ?? null;
    $attending = $data['attending'] ?? false;

    if (!$member_id || !$event_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Member ID and Event ID are required']);
        return;
    }

    try {
        $status = $attending ? 'attending' : 'not_attending';

        // Check if RSVP already exists
        $checkQuery = "SELECT id FROM event_rsvp WHERE event_id = :event_id AND member_id = :member_id";
        $checkStmt = $db->prepare($checkQuery);
        $checkStmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
        $checkStmt->bindParam(':member_id', $member_id, PDO::PARAM_INT);
        $checkStmt->execute();

        if ($checkStmt->fetch()) {
            // Update existing RSVP
            $query = "UPDATE event_rsvp SET status = :status, updated_at = NOW() 
                      WHERE event_id = :event_id AND member_id = :member_id";
        } else {
            // Create new RSVP
            $query = "INSERT INTO event_rsvp (event_id, member_id, status) 
                      VALUES (:event_id, :member_id, :status)";
        }

        $stmt = $db->prepare($query);
        $stmt->bindParam(':event_id', $event_id, PDO::PARAM_INT);
        $stmt->bindParam(':member_id', $member_id, PDO::PARAM_INT);
        $stmt->bindParam(':status', $status);

        if ($stmt->execute()) {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'RSVP updated successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to update RSVP']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    }
}

function getPrayerRequests($db)
{
    $member_id = isset($_GET['member_id']) ? $_GET['member_id'] : null;

    if (!$member_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Member ID is required']);
        return;
    }

    try {
        $query = "SELECT pr.*, 
                         CONCAT(m.first_name, ' ', m.last_name) as requester_name,
                         (SELECT COUNT(*) FROM prayer_support WHERE prayer_request_id = pr.id) as prayer_count,
                         (SELECT COUNT(*) FROM prayer_support WHERE prayer_request_id = pr.id AND member_id = :member_id) as is_praying
                  FROM prayer_requests pr
                  LEFT JOIN members m ON pr.member_id = m.mid
                  WHERE pr.is_active = 1
                  ORDER BY pr.created_at DESC
                  LIMIT 20";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':member_id', $member_id, PDO::PARAM_INT);
        $stmt->execute();

        $prayerRequests = [];
        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            $prayerRequests[] = [
                'id' => $row['id'],
                'title' => $row['title'],
                'content' => $row['request_text'],
                'requester' => $row['requester_name'],
                'date' => date('Y-m-d', strtotime($row['created_at'])),
                'prayer_count' => (int)$row['prayer_count'],
                'is_praying' => (bool)$row['is_praying']
            ];
        }

        http_response_code(200);
        echo json_encode(['success' => true, 'data' => $prayerRequests]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    }
}

function createPrayerRequest($db)
{
    $data = json_decode(file_get_contents("php://input"), true);

    $member_id = $data['member_id'] ?? null;
    $title = trim($data['title'] ?? '');
    $request_text = trim($data['request_text'] ?? '');
    $is_anonymous = $data['is_anonymous'] ?? false;

    if (!$member_id || !$title || !$request_text) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Member ID, title, and request text are required']);
        return;
    }

    try {
        $query = "INSERT INTO prayer_requests (member_id, title, request_text, is_anonymous) 
                  VALUES (:member_id, :title, :request_text, :is_anonymous)";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':member_id', $member_id, PDO::PARAM_INT);
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':request_text', $request_text);
        $stmt->bindParam(':is_anonymous', $is_anonymous, PDO::PARAM_BOOL);

        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(['success' => true, 'message' => 'Prayer request created successfully']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to create prayer request']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    }
}

function getDemographic($age, $gender)
{
    if ($age < 18) {
        return 'children';
    } elseif ($age <= 35) {
        return 'youth';
    } elseif ($gender === 'M' || $gender === 'male') {
        return 'men';
    } elseif ($gender === 'F' || $gender === 'female') {
        return 'women';
    } else {
        return 'general';
    }
}
function togglePrayerSupport($db)
{
    $data = json_decode(file_get_contents("php://input"), true);

    $member_id = $data['member_id'] ?? null;
    $prayer_request_id = $data['prayer_request_id'] ?? null;
    $is_praying = $data['is_praying'] ?? false;

    if (!$member_id || !$prayer_request_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Member ID and Prayer Request ID are required']);
        return;
    }

    try {
        if ($is_praying) {
            // Add prayer support
            $checkQuery = "SELECT id FROM prayer_support WHERE prayer_request_id = :prayer_request_id AND member_id = :member_id";
            $checkStmt = $db->prepare($checkQuery);
            $checkStmt->bindParam(':prayer_request_id', $prayer_request_id, PDO::PARAM_INT);
            $checkStmt->bindParam(':member_id', $member_id, PDO::PARAM_INT);
            $checkStmt->execute();

            if (!$checkStmt->fetch()) {
                // Insert new prayer support
                $insertQuery = "INSERT INTO prayer_support (prayer_request_id, member_id) VALUES (:prayer_request_id, :member_id)";
                $insertStmt = $db->prepare($insertQuery);
                $insertStmt->bindParam(':prayer_request_id', $prayer_request_id, PDO::PARAM_INT);
                $insertStmt->bindParam(':member_id', $member_id, PDO::PARAM_INT);
                $insertStmt->execute();
            } else {
                // Update existing prayer support
                $updateQuery = "UPDATE prayer_support SET prayer_count = prayer_count + 1, last_prayed = NOW() WHERE prayer_request_id = :prayer_request_id AND member_id = :member_id";
                $updateStmt = $db->prepare($updateQuery);
                $updateStmt->bindParam(':prayer_request_id', $prayer_request_id, PDO::PARAM_INT);
                $updateStmt->bindParam(':member_id', $member_id, PDO::PARAM_INT);
                $updateStmt->execute();
            }

            $message = 'Added to prayer support';
        } else {
            // Remove prayer support
            $deleteQuery = "DELETE FROM prayer_support WHERE prayer_request_id = :prayer_request_id AND member_id = :member_id";
            $deleteStmt = $db->prepare($deleteQuery);
            $deleteStmt->bindParam(':prayer_request_id', $prayer_request_id, PDO::PARAM_INT);
            $deleteStmt->bindParam(':member_id', $member_id, PDO::PARAM_INT);
            $deleteStmt->execute();

            $message = 'Removed from prayer support';
        }

        http_response_code(200);
        echo json_encode(['success' => true, 'message' => $message]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    }
}

function markPrayerAnswered($db)
{
    $data = json_decode(file_get_contents("php://input"), true);

    $member_id = $data['member_id'] ?? null;
    $prayer_request_id = $data['prayer_request_id'] ?? null;
    $testimony = trim($data['testimony'] ?? '');

    if (!$member_id || !$prayer_request_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Member ID and Prayer Request ID are required']);
        return;
    }

    try {
        // Check if the member owns this prayer request
        $ownerCheck = "SELECT member_id FROM prayer_requests WHERE id = :prayer_request_id";
        $ownerStmt = $db->prepare($ownerCheck);
        $ownerStmt->bindParam(':prayer_request_id', $prayer_request_id, PDO::PARAM_INT);
        $ownerStmt->execute();
        $owner = $ownerStmt->fetch(PDO::FETCH_ASSOC);

        if (!$owner || $owner['member_id'] != $member_id) {
            http_response_code(403);
            echo json_encode(['success' => false, 'message' => 'You can only mark your own prayer requests as answered']);
            return;
        }

        // Mark prayer request as answered
        $updateQuery = "UPDATE prayer_requests SET answered_at = NOW(), answered_testimony = :testimony WHERE id = :prayer_request_id";
        $updateStmt = $db->prepare($updateQuery);
        $updateStmt->bindParam(':testimony', $testimony);
        $updateStmt->bindParam(':prayer_request_id', $prayer_request_id, PDO::PARAM_INT);

        if ($updateStmt->execute()) {
            http_response_code(200);
            echo json_encode(['success' => true, 'message' => 'Prayer request marked as answered']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Failed to mark prayer as answered']);
        }
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    }
}

function getPrayerRequestDetails($db)
{
    $prayer_request_id = isset($_GET['prayer_request_id']) ? $_GET['prayer_request_id'] : null;
    $member_id = isset($_GET['member_id']) ? $_GET['member_id'] : null;

    if (!$prayer_request_id || !$member_id) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Prayer Request ID and Member ID are required']);
        return;
    }

    try {
        $query = "SELECT pr.*, 
                         CASE 
                           WHEN pr.is_anonymous = 1 THEN 'Anonymous'
                           ELSE CONCAT(m.first_name, ' ', m.last_name)
                         END as requester_name,
                         (SELECT COUNT(*) FROM prayer_support WHERE prayer_request_id = pr.id) as prayer_count,
                         (SELECT COUNT(*) FROM prayer_support WHERE prayer_request_id = pr.id AND member_id = :member_id) as is_praying,
                         pr.answered_at IS NOT NULL as is_answered
                  FROM prayer_requests pr
                  LEFT JOIN members m ON pr.member_id = m.mid
                  WHERE pr.id = :prayer_request_id";

        $stmt = $db->prepare($query);
        $stmt->bindParam(':prayer_request_id', $prayer_request_id, PDO::PARAM_INT);
        $stmt->bindParam(':member_id', $member_id, PDO::PARAM_INT);
        $stmt->execute();

        $prayerRequest = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$prayerRequest) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Prayer request not found']);
            return;
        }

        // Get prayer supporters (if not anonymous or if user is the requester)
        $showSupporters = !$prayerRequest['is_anonymous'] || $prayerRequest['member_id'] == $member_id;
        $supporters = [];

        if ($showSupporters) {
            $supportQuery = "SELECT CONCAT(m.first_name, ' ', m.last_name) as supporter_name, 
                                   ps.praying_since, ps.prayer_count
                            FROM prayer_support ps
                            JOIN members m ON ps.member_id = m.mid
                            WHERE ps.prayer_request_id = :prayer_request_id
                            ORDER BY ps.praying_since ASC";

            $supportStmt = $db->prepare($supportQuery);
            $supportStmt->bindParam(':prayer_request_id', $prayer_request_id, PDO::PARAM_INT);
            $supportStmt->execute();

            $supporters = $supportStmt->fetchAll(PDO::FETCH_ASSOC);
        }

        $response = [
            'id' => $prayerRequest['id'],
            'title' => $prayerRequest['title'],
            'content' => $prayerRequest['request_text'],
            'requester' => $prayerRequest['requester_name'],
            'priority_level' => $prayerRequest['priority_level'],
            'category' => $prayerRequest['category'],
            'date' => date('Y-m-d', strtotime($prayerRequest['created_at'])),
            'prayer_count' => (int)$prayerRequest['prayer_count'],
            'is_praying' => (bool)$prayerRequest['is_praying'],
            'is_answered' => (bool)$prayerRequest['is_answered'],
            'answered_at' => $prayerRequest['answered_at'],
            'answered_testimony' => $prayerRequest['answered_testimony'],
            'is_owner' => $prayerRequest['member_id'] == $member_id,
            'supporters' => $supporters
        ];

        http_response_code(200);
        echo json_encode(['success' => true, 'data' => $response]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Server error: ' . $e->getMessage()]);
    }
}
