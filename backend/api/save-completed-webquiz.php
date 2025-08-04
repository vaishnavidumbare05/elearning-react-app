<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

require_once '../config/db.php';
require_once __DIR__ . '/../vendor/autoload.php';

use MongoDB\Client;
use MongoDB\BSON\ObjectId;

try {
    $client = new Client("mongodb://localhost:27017");
    $db = $client->learning;
    $collection = $db->users;
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Database connection failed: " . $e->getMessage()]);
    exit;
}

// Parse input
$data = json_decode(file_get_contents("php://input"), true);

if (
    !$data ||
    !isset($data['userId'], $data['courseId'], $data['quizId'], $data['score'], $data['totalMarks'], $data['totalCorrect'], $data['totalQuestions'])
) {
    echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    exit;
}

$userId = new ObjectId($data['userId']);
$courseId = new ObjectId($data['courseId']);
$quizId = $data['quizId'];
$score = $data['score'];
$totalMarks = $data['totalMarks'];
$totalCorrect = $data['totalCorrect'];
$totalQuestions = $data['totalQuestions'];
$attempt = $data['attempt'] ?? 1;
$date = date('c');

$quizData = [
    'quizId' => $quizId,
    'score' => $score,
    'totalMarks' => $totalMarks,
    'totalCorrect' => $totalCorrect,
    'totalQuestions' => $totalQuestions,
    'attempt' => $attempt,
    'date' => $date
];

// ✅ Fetch the specific course enrollment
$user = $collection->findOne(
    ['_id' => $userId, 'enrolledCourses.courseId' => $courseId],
    ['projection' => ['enrolledCourses.$' => 1]]
);

if (!$user || !isset($user['enrolledCourses'][0])) {
    echo json_encode(["status" => "error", "message" => "User or course not found"]);
    exit;
}

$enrolledCourse = $user['enrolledCourses'][0];
$completedQuizes = $enrolledCourse['progress']['CompletedQuizes'] ?? [];

// ❌ Prevent duplicate submissions
foreach ($completedQuizes as $quiz) {
    if ($quiz['quizId'] === $quizId) {
        echo json_encode(["status" => "error", "message" => "Quiz already submitted"]);
        exit;
    }
}

// ✅ Push quiz to CompletedQuizes of matching course
$updateResult = $collection->updateOne(
    [
        '_id' => $userId,
        'enrolledCourses.courseId' => $courseId
    ],
    [
        '$push' => [
            'enrolledCourses.$.progress.CompletedQuizes' => $quizData
        ]
    ]
);

if ($updateResult->getModifiedCount() > 0) {
    echo json_encode(["status" => "success", "message" => "Quiz saved successfully"]);
} else {
    echo json_encode(["status" => "error", "message" => "Quiz not saved"]);
}
?>
