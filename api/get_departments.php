<?php
require_once 'config/db.php';

header('Content-Type: application/json');

$sql = "SELECT 
            d.dept_id, 
            d.dept_name, 
            d.description, 
            lr.role_name, 
            m.first_name, 
            m.last_name
        FROM departments d
        LEFT JOIN leadership_roles lr ON d.dept_id = lr.dept_id
        LEFT JOIN member_leadership ml ON lr.role_id = ml.role_id
        LEFT JOIN members m ON ml.member_id = m.mid
        ORDER BY d.dept_name, lr.role_name";

$result = $conn->query($sql);

$departments = [];
if ($result->num_rows > 0) {
    while($row = $result->fetch_assoc()) {
        $dept_id = $row['dept_id'];
        if (!isset($departments[$dept_id])) {
            $departments[$dept_id] = [
                'id' => $dept_id,
                'name' => $row['dept_name'],
                'description' => $row['description'],
                'leaders' => []
            ];
        }

        if ($row['role_name'] && $row['first_name']) {
            $departments[$dept_id]['leaders'][] = [
                'role' => $row['role_name'],
                'name' => $row['first_name'] . ' ' . $row['last_name']
            ];
        }
    }
}

echo json_encode(['success' => true, 'data' => array_values($departments)]);

$conn->close();
?>