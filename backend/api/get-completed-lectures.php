<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

require_once '../config/db.php';
require_once __DIR__ . '/../vendor/autoload.php';

use MongoDB\BSON\ObjectId;

$data = json_decode(file_get_contents("php://input"), true);

$userId = $data['userId'] ?? null;
$courseId = $data['courseId'] ?? null;                                                                                                          

if (!$data || !$userId || !$courseId) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

try {
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $usersCollection = $client->learning->users;

    $userIdObj = new ObjectId($userId);
    $courseIdObj = new ObjectId($courseId);

    $user = $usersCollection->findOne(['_id' => $userIdObj]);

    if (!$user) {
        echo json_encode(["success" => false, "message" => "User not found"]);
        exit;
    }

    $enrolledCourseIndex = null;
    foreach ($user['enrolledCourses'] as $index => $course) {
        if ((string)$course['courseId'] === (string)$courseIdObj) {
            $enrolledCourseIndex = $index;
            break;
        }
    }

    if ($enrolledCourseIndex === null) {
        echo json_encode(["success" => false, "message" => "Course not found in user's enrolledCourses"]);
        exit;
    }

    $completedLectures = $user['enrolledCourses'][$enrolledCourseIndex]['progress']['completedLectures'] ?? [];

    // Convert BSONArray to PHP array if necessary
    if ($completedLectures instanceof MongoDB\Model\BSONArray) {
        $completedLectures = iterator_to_array($completedLectures);
    }

    // Map ObjectIds to strings for consistent output
    $completedLectureIds = array_map(
        fn($id) => (string)$id,
        $completedLectures
    );

    echo json_encode([
        "success" => true,
        "completedLectures" => $completedLectureIds
    ]);

} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to fetch completed lectures",
        "error" => $e->getMessage()
    ]);
}
?>