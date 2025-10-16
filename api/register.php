<?php
header('Content-Type: application/json');
require 'config/db.php';

$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
if (!isset($data['first_name'], $data['last_name'], $data['gender'], $data['dob'], $data['address'], $data['phone_number'])) {
    echo json_encode(['success' => false, 'message' => 'Missing fields']);
    exit;
}

// Sanitize input
$first_name = $conn->real_escape_string($data['first_name']);
$last_name = $conn->real_escape_string($data['last_name']);
$gender = $conn->real_escape_string($data['gender']);
$dob = $conn->real_escape_string($data['dob']);
$address = $conn->real_escape_string($data['address']);
$phone_number = $conn->real_escape_string($data['phone_number']);

// Insert into Members table
$sql = "INSERT INTO Members (first_name, last_name, gender, dob, address, phone_number) 
        VALUES ('$first_name', '$last_name', '$gender', '$dob', '$address', '$phone_number')";

if ($conn->query($sql)) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Database error: ' . $conn->error]);
}
