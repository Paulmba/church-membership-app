<?php
// config/db.php

$host = "localhost";
$dbname = "church_membership";
$user = "root";          // Change if needed
$password = "1234567890"; // Change if needed

// Create connection
$conn = new mysqli($host, $user, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode([
        'success' => false,
        'message' => 'Database connection failed',
        'error' => $conn->connect_error
    ]));
}

// Set character set
$conn->set_charset("utf8mb4");
?>