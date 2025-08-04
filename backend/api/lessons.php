<?php
// // Allow cross-origin requests (CORS)
// header("Access-Control-Allow-Origin: http://localhost:3000");
// header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
// header("Access-Control-Allow-Headers: Content-Type, Authorization");

// header('Content-Type: application/json');

// // Include the database class
// require '../config/db.php'; // Adjust path if needed

// // Initialize the database connection
// try {
//     $dbInstance = new Database(); // Create an instance of the Database class
//     $db = $dbInstance->getDb(); // Get the database instance
//     $collection = $dbInstance->getCollection("software_developer_videos"); // Access the desired collection
// } catch (Exception $e) {
//     echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
//     exit;
// }

// // Fetch all lessons from the collection (no filtering by course_id)
// try {
//     $lessons = $collection->find(); // Fetch all records from the collection

//     $result = [];
//     foreach ($lessons as $lesson) {
//         $result[] = [
//             "title" => $lesson['title'],
//             "duration" => $lesson['duration'],
//             "status" => $lesson['status'],
//             "path" => $lesson['path']
//         ];
//     }

//     echo json_encode($result);

// } catch (Exception $e) {
//     echo json_encode(["error" => "Error fetching lessons: " . $e->getMessage()]);
// }




// Allow cross-origin requests (CORS)
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, PUT, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

header('Content-Type: application/json');

// Include the database class
require '../config/db.php'; // Adjust path if needed

// Initialize the database connection
try {
    $dbInstance = new Database(); // Create an instance of the Database class
    $db = $dbInstance->getDb(); // Get the database instance
    $collection = $dbInstance->getCollection("software_developer_videos"); // Access the desired collection
} catch (Exception $e) {
    echo json_encode(["error" => "Database connection failed: " . $e->getMessage()]);
    exit;
}

// Fetch all lessons from the collection (no filtering by course_id)
if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $lessons = $collection->find(); // Fetch all records from the collection

        $result = [];
        foreach ($lessons as $lesson) {
            $result[] = [
                "id" => (string)$lesson['_id'], // Add the ID for identification
                "title" => $lesson['title'],
                "duration" => $lesson['duration'],
                "status" => $lesson['status'],
                "path" => $lesson['path'],
                "videoUrl" => $lesson['videoUrl'] ?? ""
            ];
        }

        echo json_encode($result);
    } catch (Exception $e) {
        echo json_encode(["error" => "Error fetching lessons: " . $e->getMessage()]);
    }
}

// Update lesson status
if ($_SERVER['REQUEST_METHOD'] === 'PUT') {
    // Get the lesson ID from the URL
    if (isset($_GET['id']) && !empty($_GET['id'])) {
        $lessonId = $_GET['id'];
        
        // Decode the incoming request data (status)
        $data = json_decode(file_get_contents("php://input"), true);
        $status = $data['status'] ?? null;

        if ($status) {
            try {
                // Update the status of the specific lesson using the ObjectId
                $updateResult = $collection->updateOne(
                    ['_id' => new MongoDB\BSON\ObjectId($lessonId)], // Find video by ID
                    ['$set' => ['status' => $status]] // Set new status
                );

                if ($updateResult->getModifiedCount() > 0) {
                    echo json_encode(["message" => "Status updated successfully"]);
                } else {
                    echo json_encode(["error" => "Failed to update status or status is already the same"]);
                }
            } catch (Exception $e) {
                echo json_encode(["error" => "Error updating status: " . $e->getMessage()]);
            }
        } else {
            echo json_encode(["error" => "No status provided in the request"]);
        }
    } else {
        echo json_encode(["error" => "Lesson ID not provided"]);
    }
}
?>

