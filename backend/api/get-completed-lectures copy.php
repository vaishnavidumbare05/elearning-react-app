<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../vendor/autoload.php'; // MongoDB Autoload

// try {
//     $data = json_decode(file_get_contents("php://input"), true);

//     if (!isset($data['userId']) || !isset($data['courseId'])) {
//         echo json_encode([
//             "success" => false,
//             "message" => "Missing userId or courseId"
//         ]);
//         exit;
//     }

try {
    $userId = $data['userId'];
    // Validate ObjectId format
    if (!preg_match('/^[0-9a-fA-F]{24}$/', $userId)) {
        throw new Exception("Invalid ObjectId format: $userId");
    }
    $user = $collection->findOne([
        '_id' => new MongoDB\BSON\ObjectId($userId)
    ]);
} catch (Exception $e) {
    error_log("❌ ObjectId Error: " . $e->getMessage());
    echo json_encode([
        "success" => false,
        "message" => "Error fetching data",
        "error" => $e->getMessage()
    ]);
    exit;
}

    $userId = $data['userId'];
    $courseId = $data['courseId'];

    // Connect to MongoDB
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $db = $client->learning;
    $collection = $db->users;

    // Find the user by ObjectId
    $user = $collection->findOne([
        '_id' => new MongoDB\BSON\ObjectId($userId)
    ]);

    if (!$user) {
        echo json_encode([
            "success" => false,
            "message" => "User not found"
        ]);
        exit;
    }

    $completedLectures = [];

    // Loop through enrolledCourses
    foreach ($user['enrolledCourses'] as $course) {
        // Normalize courseId from DB
        if (isset($course['courseId'])) {
            $dbCourseId = is_array($course['courseId']) && isset($course['courseId']['$oid'])
                ? $course['courseId']['$oid']
                : (string) $course['courseId'];

            error_log("DB CourseId: $dbCourseId | Requested CourseId: $courseId");

            // Match courseId with incoming request
            if ($dbCourseId === $courseId) {
                error_log("✅ Matched course!");

                // // Check if completedLectures exists
                // if (isset($course['progress']['completedLectures']) && is_array($course['progress']['completedLectures'])) {
                //     foreach ($course['progress']['completedLectures'] as $lectureId) {
                //         if ($lectureId instanceof MongoDB\BSON\ObjectId) {
                //             $completedLectures[] = $lectureId->__toString();
                //         } elseif (is_array($lectureId) && isset($lectureId['$oid'])) {
                //             $completedLectures[] = $lectureId['$oid'];
                //         } else {
                //             $completedLectures[] = (string) $lectureId;
                //         }
                //     }
                // } else {
                //     error_log("⚠️ No completedLectures found for this course.");
                // }
                if (isset($course['progress']['completedLectures']) && is_array($course['progress']['completedLectures'])) {
                    foreach ($course['progress']['completedLectures'] as $lectureId) {
                        if ($lectureId instanceof MongoDB\BSON\ObjectId) {
                            $completedLectures[] = $lectureId->__toString();
                        } elseif (is_array($lectureId) && isset($lectureId['$oid'])) {
                            $completedLectures[] = $lectureId['$oid'];
                        } else {
                            $completedLectures[] = (string) $lectureId;
                        }
                    }
                } else {
                    error_log("⚠️ Progress or completedLectures missing or not an array for courseId: $dbCourseId");
                    error_log("Progress data: " . print_r($course['progress'] ?? 'undefined', true));
                }

                break; // Stop checking after match
            }
        }
    }

    // Final log before response
    error_log("✅ Completed Lectures Array: " . json_encode($completedLectures));

    // Final response
    echo json_encode([
        "success" => true,
        "completedLectures" => $completedLectures
    ]);

} catch (Exception $e) {
    error_log("❌ Error: " . $e->getMessage());

    echo json_encode([
        "success" => false,
        "message" => "Error fetching data",
        "error" => $e->getMessage()
    ]);
}
