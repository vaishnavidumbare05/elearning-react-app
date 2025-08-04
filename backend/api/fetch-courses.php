<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/db.php';
require_once __DIR__ . '/../vendor/autoload.php';

try {
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $db = $client->learning;
    $coursesCollection = $db->courses;
    $usersCollection = $db->users;

    $coursesCursor = $coursesCollection->find([]);
    $usersCursor = $usersCollection->find([]);

    $users = iterator_to_array($usersCursor); // Get all users
    $slugMap = [
        'Python Programming' => 'python',
        'Web Development' => 'webdevelopement',
        'HTML/CSS/JavaScript' => 'webdevelopement'
    ];

    $courses = [];

    foreach ($coursesCursor as $course) {
        $courseId = $course['_id'];
        $title = $course['title'];
        $slug = $slugMap[$title] ?? strtolower(str_replace([' ', '/', '\\'], '-', $title));
        $enrolledUsers = [];

        foreach ($users as $user) {
            if (!isset($user['enrolledCourses'])) continue;

            foreach ($user['enrolledCourses'] as $enrollment) {
                if ((string)$enrollment['courseId'] === (string)$courseId) {
                    $enrolledUsers[] = [
                        'userId' => (string)$user['_id'],
                        'enrolledAt' => isset($enrollment['enrolledDate'])
                            ? $enrollment['enrolledDate']->toDateTime()->format(DATE_ISO8601)
                            : null
                    ];
                    break; // prevent duplicate entry
                }
            }
        }

        $courses[] = [
    '_id' => (string)$courseId,
    'title' => $title,
    'description' => $course['description'] ?? '',
    'duration' => $course['duration'] ?? '',
    'image' => $course['image'] ?? '',
    'name' => $course['name'] ?? '',
    'price' => $course['price'] ?? '', // ✅ NEW FIELD ADDED
    'enrolledUsers' => $enrolledUsers,
    'enrolledUsersLink' => "http://localhost:3000/course/$slug/" . (string)$courseId,
    'notEnrolledUsersLink' => "http://localhost:3000/course/{$slug}-intro/" . (string)$courseId
];

    }

    echo json_encode(["success" => true, "courses" => $courses]);
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Failed to connect to MongoDB: " . $e->getMessage()]);
}
