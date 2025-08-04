<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

require '../config/db.php';
require_once '../vendor/autoload.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);
    error_log("Decoded JSON: " . json_encode($data));

    $userId = $data['userId'] ?? null;
    $requestedCourseId = $data['courseId'] ?? null;

    if (!$userId || !$requestedCourseId) {
        throw new Exception('User ID and Course ID are required');
    }

    $client = new MongoDB\Client("mongodb://localhost:27017");
    $db = $client->learning;

    // Fetch user document
    $user = $db->users->findOne(
        ['_id' => new MongoDB\BSON\ObjectId($userId)],
        ['projection' => ['name' => 1, 'enrolledCourses' => 1]]
    );

    if (!$user) {
        throw new Exception('User not found');
    }

    // Convert courseId to ObjectId and check enrollment
    $requestedCourseIdObj = new MongoDB\BSON\ObjectId($requestedCourseId);
    $matchedCourse = null;

    foreach ($user['enrolledCourses'] ?? [] as $course) {
        if ((string)$course['courseId'] === (string)$requestedCourseIdObj) {
            $matchedCourse = $course;
            break;
        }
    }

    if (!$matchedCourse) {
        throw new Exception('User is not enrolled in the requested course');
    }

    // Fetch course details
    $course = $db->courses->findOne(['_id' => $requestedCourseIdObj]);
    if (!$course) {
        throw new Exception('Course not found');
    }

    // Calculate total duration
    $totalDuration = 0;
   if (isset($course['duration'])) {
    preg_match('/(?:(\d+)\s*min)?\s*(?:(\d+)\s*sec)?/i', $course['duration'], $matches);
    
    $minutes = isset($matches[1]) ? (int)$matches[1] : 0;
    $seconds = isset($matches[2]) ? (int)$matches[2] : 0;

    $totalDuration = ($minutes * 60) + $seconds;
   }
    else {
        $videos = $db->web_videos->find(['courseId' => $course['_id']], ['projection' => ['duration' => 1]]);
        foreach ($videos as $video) {
            $totalDuration += $video['duration'] ?? 0;
        }
    }

    // Respond with certificate-relevant info
    echo json_encode([
        'success' => true,
        'userName' => $user['name'] ?? '',
        'courseTitle' => $course['title'] ?? '',
        'totalDuration' => $totalDuration,
        'courseId' => (string)$requestedCourseIdObj,
        'date' => date('Y-m-d')
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
