<?php
// api/upload_profile_photo.php - MySQLi version

// Log requests for debugging
file_put_contents('upload-log.txt', "Upload request received at " . date('Y-m-d H:i:s') . "\n", FILE_APPEND);
file_put_contents('upload-log.txt', "POST data: " . print_r($_POST, true) . "\n", FILE_APPEND);
file_put_contents('upload-log.txt', "Request body: " . file_get_contents('php://input') . "\n", FILE_APPEND);

header('Content-Type: application/json');

require_once __DIR__ . '/config/db.php';
require_once __DIR__ . '/../middleware/JWTMiddleware.php';

$auth = new JWTMiddleware();
$auth->authenticate();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method Not Allowed']);
    exit;
}

$memberId = isset($_POST['mid']) ? (int)$_POST['mid'] : 0;

if ($memberId <= 0) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Invalid member ID', 'post_data' => $_POST]);
    exit;
}

if (isset($_FILES['profile_photo'])) {
    $file = $_FILES['profile_photo'];

    $fileName = $file['name'];
    $fileTmpName = $file['tmp_name'];
    $fileSize = $file['size'];
    $fileError = $file['error'];

    $fileExt = explode('.', $fileName);
    $fileActualExt = strtolower(end($fileExt));

    $allowed = ['jpg', 'jpeg', 'png'];

    if (in_array($fileActualExt, $allowed)) {
        if ($fileError === 0) {
            if ($fileSize < 5000000) {
                $fileNameNew = "profile_" . $memberId . "_" . uniqid('', true) . "." . $fileActualExt;
                $fileDestination = __DIR__ . '/uploads/profile_photos/' . $fileNameNew;

                if (move_uploaded_file($fileTmpName, $fileDestination)) {
                    $fileUrl = 'http://' . $_SERVER['HTTP_HOST'] . '/get_profile_photo.php?file=' . $fileNameNew;

                    // MySQLi update
                    $stmt = $conn->prepare("UPDATE Members SET profile_photo_url = ? WHERE mid = ?");
                    $stmt->bind_param("si", $fileUrl, $memberId);

                    if ($stmt->execute()) {
                        echo json_encode([
                            'success' => true,
                            'message' => 'Profile photo updated successfully',
                            'data' => ['profile_photo_url' => $fileUrl]
                        ]);
                    } else {
                        http_response_code(500);
                        echo json_encode(['success' => false, 'message' => 'Database error', 'error' => $stmt->error]);
                    }
                } else {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'message' => 'Failed to move uploaded file']);
                }
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'File is too large']);
            }
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Error uploading file']);
        }
    } else {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Invalid file type']);
    }
} else {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'No file uploaded']);
}