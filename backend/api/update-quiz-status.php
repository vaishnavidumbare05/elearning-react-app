<?php
require_once '../config/db.php'; // Include your DB connection
require_once __DIR__ . '/../vendor/autoload.php';

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

// Database connection
$mongo = new MongoDB\Client("mongodb://localhost:27017");
$collection = $mongo->learning->python_course_quizes; // replace yourDBname

// Function to update Quiz 1 status
function markQuiz1Completed($collection) {
    $quizId = '6612e1fc8f1b2d6f8f9a0001'; // ObjectId for Quiz 1

    $result = $collection->updateOne(
        ['_id' => new MongoDB\BSON\ObjectId($quizId)],
        ['$set' => ['status' => 'completed']]
    );

    if ($result->getModifiedCount() === 1) {
        echo json_encode(['status' => 'success', 'message' => 'Quiz 1 marked completed']);
    } else {
        echo json_encode(['status' => 'info', 'message' => 'Quiz 1 already completed or not found']);
    }
}

// Function to update Quiz 2 status
function markQuiz2Completed($collection) {
    $quizId = '6612e1fc8f1b2d6f8f9a0002'; // ObjectId for Quiz 2

    $result = $collection->updateOne(
        ['_id' => new MongoDB\BSON\ObjectId($quizId)],
        ['$set' => ['status' => 'completed']]
    );

    if ($result->getModifiedCount() === 1) {
        echo json_encode(['status' => 'success', 'message' => 'Quiz 2 marked completed']);
    } else {
        echo json_encode(['status' => 'info', 'message' => 'Quiz 2 already completed or not found']);
    }
}

// Decide which function to call based on `quiz` in the request
$data = json_decode(file_get_contents("php://input"), true);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($data['quiz'])) {
    if ($data['quiz'] === 'quiz1') {
        markQuiz1Completed($collection);
    } elseif ($data['quiz'] === 'quiz2') {
        markQuiz2Completed($collection);
    } else {
        echo json_encode(['status' => 'error', 'message' => 'Invalid quiz identifier']);
    }
} else {
    echo json_encode(['status' => 'error', 'message' => 'Invalid request']);
}
?>
