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

// Handle if lectureId is in the format: ['$oid' => '...']
$lectureId = isset($data['lectureId']['$oid']) ? $data['lectureId']['$oid'] : ($data['lectureId'] ?? null);

if (!$data || !$userId || !$courseId || !$lectureId) {
    echo json_encode(["success" => false, "message" => "Missing required fields"]);
    exit;
}

try {
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $usersCollection = $client->learning->users;
    $videosCollection = $client->learning->videos;

    // Validate video exists
    $video = $videosCollection->findOne([
        '_id' => new ObjectId($lectureId)
    ]);

    if (!$video) {
        echo json_encode(["success" => false, "message" => "Lecture video not found"]);
        exit;
    }

    $userIdObj = new ObjectId($userId);
    $courseIdObj = new ObjectId($courseId);
    $lectureIdObj = new ObjectId($lectureId);

    $user = $usersCollection->findOne(['_id' => $userIdObj]);

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

    // ✅ Fix: Convert BSONArray to PHP array before array_map
    $completedLecturesArray = is_array($completedLectures) ? $completedLectures : iterator_to_array($completedLectures);
    $lectureExists = in_array((string)$lectureIdObj, array_map('strval', $completedLecturesArray));

    if (!$lectureExists) {
        $usersCollection->updateOne(
            [
                '_id' => $userIdObj,
                'enrolledCourses.courseId' => $courseIdObj
            ],
            [
                '$push' => [
                    'enrolledCourses.$.progress.completedLectures' => $lectureIdObj
                ],
                '$currentDate' => [
                    'enrolledCourses.$.progress.lastUpdated' => true,
                    'enrolledCourses.$.lastAccessed' => true
                ]
            ]
        );
    } else {
        $usersCollection->updateOne(
            [
                '_id' => $userIdObj,
                'enrolledCourses.courseId' => $courseIdObj
            ],
            [
                '$currentDate' => [
                    'enrolledCourses.$.progress.lastUpdated' => true,
                    'enrolledCourses.$.lastAccessed' => true
                ]
            ]
        );
    }

    $user = $usersCollection->findOne(['_id' => $userIdObj]);

    $enrolledCourse = null;
    foreach ($user['enrolledCourses'] as $course) {
        if ((string)$course['courseId'] === (string)$courseIdObj) {
            $enrolledCourse = $course;
            break;
        }
    }

    if ($enrolledCourse) {
        $totalLectures = $videosCollection->countDocuments(['courseId' => $courseIdObj]);
        $completedLecturesCount = count($enrolledCourse['progress']['completedLectures'] ?? []);

        $newProgress = $totalLectures > 0
            ? round(($completedLecturesCount / $totalLectures) * 100)
            : 0;

        $usersCollection->updateOne(
            [
                '_id' => $userIdObj,
                'enrolledCourses.courseId' => $courseIdObj
            ],
            [
                '$set' => [
                    'enrolledCourses.$.progress.overallProgress' => $newProgress
                ]
            ]
        );
    }

    $completedLectures = $enrolledCourse['progress']['completedLectures'];

    // Check if it's a BSONArray and convert to PHP array
    if ($completedLectures instanceof MongoDB\Model\BSONArray) {
        $completedLectures = iterator_to_array($completedLectures); // Convert BSONArray to PHP array
    }
    
    // Now you can apply array_map() safely
    $completedLectureIds = array_map(
        fn($id) => (string)$id,
        $completedLectures ?? []
    );
    error_log("Completed Lectures sent: " . json_encode($completedLectureIds));
    
    echo json_encode([
        "success" => true,
        "message" => "Lecture marked as completed",
        "completedLectures" => $completedLectureIds
    ]);
    
    
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "message" => "Failed to mark lecture",
        "error" => $e->getMessage()
    ]);
}
?>
