<?php
// api/get_profile_photo.php

if (isset($_GET['file'])) {
    $fileName = $_GET['file'];
    $filePath = __DIR__ . '/uploads/profile_photos/' . $fileName;

    if (file_exists($filePath)) {
        $imageInfo = getimagesize($filePath);
        $contentType = $imageInfo['mime'];

        header('Content-Type: ' . $contentType);
        readfile($filePath);
        exit;
    }
}

http_response_code(404);
echo 'Image not found';
?>