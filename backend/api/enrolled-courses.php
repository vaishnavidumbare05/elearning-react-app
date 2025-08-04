<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/db.php';
require_once __DIR__ . '/../vendor/autoload.php';

$client = new MongoDB\Client("mongodb://localhost:27017");
$usersCollection = $client->learning->users;
$coursesCollection = $client->learning->courses;

// Get the userName from query parameters
$userName = trim($_GET['userName'] ?? '');

if (!$userName) {
    echo json_encode(["error" => "User Name is required"]);
    exit;
}

try {
    // Find the user by name (case-insensitive)
    $user = $usersCollection->findOne(['name' => new MongoDB\BSON\Regex("^$userName$", 'i')]);

    if (!$user) {
        echo json_encode(["error" => "User not found"]);
        exit;
    }

    $userId = $user['_id'];

    // Fetch only the courses where the user is enrolled
    $enrolledCoursesCursor = $coursesCollection->find([
        'enrolledUsers.userId' => $userId
    ]);

    $coursesArray = iterator_to_array($enrolledCoursesCursor);

    // Optional: remove enrolledUsers field to reduce payload size
    foreach ($coursesArray as &$course) {
        unset($course['enrolledUsers']);
    }

    echo json_encode($coursesArray);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
