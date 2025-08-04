<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

require_once '../config/db.php';
require_once __DIR__ . '/../vendor/autoload.php';

// Connect to MongoDB
$client = new MongoDB\Client("mongodb://localhost:27017");
$coursesCollection = $client->learning->courses; // Replace 'learning' with your actual DB name

// Get the courseId from query parameters
$courseId = isset($_GET['courseId']) ? trim($_GET['courseId']) : null;

if (!$courseId) {
    echo json_encode(["error" => "Course ID is required"]);
    exit;
}

try {
    // Fetch the course details based on courseId
    $course = $coursesCollection->findOne(['_id' => new MongoDB\BSON\ObjectId($courseId)]);

    if (!$course) {
        echo json_encode(["error" => "Course not found"]);
        exit;
    }

    // Return the course details
    echo json_encode($course);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
?>