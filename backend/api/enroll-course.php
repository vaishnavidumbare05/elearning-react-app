<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

require_once '../config/db.php';
require_once __DIR__ . '/../vendor/autoload.php';

$client = new MongoDB\Client("mongodb://localhost:27017");
$usersCollection = $client->learning->users;
$coursesCollection = $client->learning->courses;

$data = json_decode(file_get_contents("php://input"), true);

if (!$data || !isset($data['userId']) || !isset($data['courseTitle'])) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

use MongoDB\BSON\ObjectId;

$userId = $data["userId"];
$courseTitle = $data["courseTitle"];

if (!preg_match('/^[a-f\d]{24}$/i', $userId)) {
    echo json_encode(["success" => false, "message" => "Invalid user ID format"]);
    exit;
}

$userObjectId = new ObjectId($userId);

try {
    $course = $coursesCollection->findOne([
        'title' => new MongoDB\BSON\Regex('^' . preg_quote($courseTitle) . '$', 'i')
    ]);

    if (!$course) {
        echo json_encode(["success" => false, "message" => "Course '$courseTitle' not found"]);
        exit;
    }

    $courseId = $course['_id'];

    // Check if already enrolled (updated query)
    $alreadyEnrolled = $usersCollection->findOne([
        '_id' => $userObjectId,
        'enrolledCourses.courseId' => $courseId
    ]);

    if ($alreadyEnrolled) {
        echo json_encode(["success" => false, "message" => "Already enrolled"]);
        exit;
    }

    // Get all lectures and quizzes for this course to initialize progress
    $lectures = $course['lectures'] ?? [];
    $quizzes = $course['quizzes'] ?? [];
    
    // Prepare initial progress data
    $initialProgress = [
        'courseId' => $courseId,
        'enrolledDate' => new MongoDB\BSON\UTCDateTime(),
        'lastAccessed' => new MongoDB\BSON\UTCDateTime(),
        
    ];

    // Enroll user with fresh progress tracking
    $result1 = $usersCollection->updateOne(
        ['_id' => $userObjectId],
        ['$push' => ['enrolledCourses' => $initialProgress]]
    );

    // Add user to course's enrolledUsers
   $result2 = $coursesCollection->updateOne(
    ['_id' => $courseId],
    ['$addToSet' => ['enrolledUsers' => [
        'userId' => $userObjectId,
        'enrolledDate' => new MongoDB\BSON\UTCDateTime()
    ]]]
);


    if ($result1->getModifiedCount() > 0 || $result2->getModifiedCount() > 0) {
        echo json_encode([
            "success" => true, 
            "message" => "Enrollment successful",
            "progress" => $initialProgress
        ]);
    } else {
        echo json_encode(["success" => false, "message" => "Enrollment failed"]);
    }

} catch (Exception $e) {
    error_log("Enrollment Error: " . $e->getMessage());
    echo json_encode([
        "success" => false, 
        "message" => "Database error",
        "error" => $e->getMessage()
    ]);
}
?>