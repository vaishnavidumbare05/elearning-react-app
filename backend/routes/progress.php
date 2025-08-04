<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/db.php';
require_once __DIR__ . '/../vendor/autoload.php';

use MongoDB\BSON\ObjectId;

$data = json_decode(file_get_contents("php://input"), true);

$userId = $data['userId'] ?? null;
$inputCourseId = $data['courseId'] ?? null;

if (!$userId || !$inputCourseId) {
    echo json_encode(["success" => false, "message" => "Missing userId or courseId"]);
    exit;
}

try {
    $client = new MongoDB\Client('mongodb://localhost:27017');

    $videosCollection = $client->learning->videos;  // Your video collection
    $usersCollection = $client->learning->users;    // Your user collection

    $userObjectId = new ObjectId($userId);
    $courseObjectId = new ObjectId($inputCourseId);

    // Get user document
    $user = $usersCollection->findOne(['_id' => $userObjectId]);

    if (!$user) {
        echo json_encode(["success" => false, "message" => "User not found"]);
        exit;
    }

    // Find enrolled course that matches the given courseId
    $enrolledCourses = $user['enrolledCourses'] ?? [];
    $matchedCourse = null;

    foreach ($enrolledCourses as $course) {
        if ((string)$course['courseId'] === (string)$courseObjectId) {
            $matchedCourse = $course;
            break;
        }
    }

    if (!$matchedCourse) {
        echo json_encode(["success" => false, "message" => "User is not enrolled in the specified course"]);
        exit;
    }

    // Fetch completed lectures for the course
    $completedLectures = $matchedCourse['progress']['completedLectures'] ?? [];
    $completedCount = count($completedLectures);

    // Count total lectures in that course
    $totalLectures = $videosCollection->countDocuments([]);

    $progressPercentage = $totalLectures > 0 
        ? min(100, round(($completedCount / $totalLectures) * 100, 2)) 
        : 0;

    echo json_encode([
        "success" => true,
        "progress" => $progressPercentage,
        "completedLectures" => $completedCount,
        "totalLectures" => $totalLectures,
        "courseId" => (string)$courseObjectId
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to fetch progress",
        "error" => $e->getMessage()
    ]);
}
?>
