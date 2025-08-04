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

    $user = $usersCollection->findOne(['_id' => $userIdObj], ['projection' => ['enrolledCourses' => 1]]);

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

    $completedQuizes = $user['enrolledCourses'][$enrolledCourseIndex]['progress']['CompletedQuizes'] ?? [];

    // If it's a BSONArray, convert to a PHP array
    if ($completedQuizes instanceof MongoDB\Model\BSONArray) {
        $completedQuizes = iterator_to_array($completedQuizes);
    }

    // Convert ObjectIds to strings in quizId field
    $completedQuizesFormatted = array_map(function ($quiz) {
        return [
            "quizId" => (string)($quiz['quizId'] ?? ''),
            "score" => $quiz['score'] ?? 0,
            "totalCorrect" => $quiz['totalCorrect'] ?? 0,
            "totalMarks" => $quiz['totalMarks'] ?? 0,
            "totalQuestions" => $quiz['totalQuestions'] ?? 0,
            "date" => $quiz['date'] ?? ''
        ];
    }, $completedQuizes);

    echo json_encode([
        "success" => true,
        "completedQuizes" => $completedQuizesFormatted
    ]);

    error_log(print_r($completedQuizesFormatted, true)); // Debug log
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to fetch completed quizzes",
        "error" => $e->getMessage()
    ]);
}
?>
