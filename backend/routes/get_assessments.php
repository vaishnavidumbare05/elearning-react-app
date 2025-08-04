<?php
// get_assessments.php
// CORS Headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
require_once '../config/db.php'; // Ensure the path is correct

$collection = $db->assessments;

// Fetch all assessments from the database
$assessments = $collection->find()->toArray();

// Return the assessments as a JSON response
echo json_encode(['assessments' => $assessments]);
?>
