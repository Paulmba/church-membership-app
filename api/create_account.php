<?php
header('Content-Type: application/json');
require 'db.php';

$data = json_decode(file_get_contents("php://input"), true);

if (!isset($data['phone_number'], $data['password'])) {
    echo json_encode(['success' => false, 'message' => 'Missing fields']);
    exit;
}

$phone_number = $conn->real_escape_string($data['phone_number']);
$password = password_hash($data['password'], PASSWORD_BCRYPT);

// Find member ID by phone number
$result = $conn->query("SELECT mid FROM Members WHERE phone_number = '$phone_number'");
if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Member not found']);
    exit;
}

$row = $result->fetch_assoc();
$mid = $row['mid'];

// Check if account already exists
$check = $conn->query("SELECT * FROM MobileUsers WHERE phone_number = '$phone_number'");
if ($check->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Account already exists']);
    exit;
}

// Insert into MobileUsers table
$insert = "INSERT INTO MobileUsers (mid, phone_number, password) 
           VALUES ($mid, '$phone_number', '$password')";

if ($conn->query($insert)) {
    echo json_encode(['success' => true]);
} else {
    echo json_encode(['success' => false, 'message' => 'Insert failed: ' . $conn->error]);
}
