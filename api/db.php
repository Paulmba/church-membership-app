<?php
// db.php

$host = "localhost";
$user = "root";         // Change if needed
$password = "1234567890";         // Change if needed
$dbname = "church_membership";

// Create connection
$conn = new mysqli($host, $user, $password, $dbname);

// Check connection
if ($conn->connect_error) {
    die(json_encode(['success' => false, 'message' => 'Database connection failed']));
}

$conn->set_charset("utf8");
