<?php
// // Allow cross-origin requests (useful for frontend-backend communication on different ports)
// header('Access-Control-Allow-Origin: *'); // Allow all origins (you can restrict this to specific domains for security)
// header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE'); // Allow PUT method
// header('Access-Control-Allow-Headers: Content-Type'); // Allow headers like Content-Type
// header('Content-Type: application/json');

// // Handle preflight requests
// if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
//     exit; // If it's a preflight request, just exit with no response
// }

// // Get the title from the URL parameter
// $title = isset($_GET['title']) ? $_GET['title'] : null;
// // Get the status from the body
// $data = json_decode(file_get_contents("php://input"), true);
// $status = isset($data['status']) ? $data['status'] : null;

// // Check if both title and status are provided
// if (empty($title) || empty($status)) {
//     echo json_encode(["error" => "Video title and status are required"]);
//     exit;
// }

// // Assuming you are using MongoDB
// require_once __DIR__ . '/../vendor/autoload.php';  // Adjust the path if necessary
// use MongoDB\Client;
// $client = new MongoDB\Client("mongodb://localhost:27017");
// $collection = $client->learning->videos;

// // Validate status value
// if (!in_array($status, ['incomplete', 'in-progress', 'completed'])) {
//     echo json_encode(["error" => "Invalid status value"]);
//     exit;
// }

// // Find the video by title and update its status
// $updateResult = $collection->updateOne(
//     ['title' => $title],  // Match by title
//     ['$set' => ['status' => $status]]  // Update the status field
// );

// // Check if the update was successful
// if ($updateResult->getModifiedCount() > 0) {
//     echo json_encode(["message" => "Video status updated successfully"]);
// } else {
//     echo json_encode(["message" => "No changes made"]);
// } 




// Allow cross-origin requests from your frontend's origin
header("Access-Control-Allow-Origin: http://localhost:3000"); // Use * to allow all origins or specify your exact origin for security
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS"); // Allow specific HTTP methods
header("Access-Control-Allow-Headers: Content-Type"); // Allow specific headers
header("Content-Type: application/json");

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    // Respond with the necessary headers and exit
    http_response_code(204); // No content
    exit;
}
// Get the title from the URL parameter
$title = isset($_GET['title']) ? $_GET['title'] : null;
// Get the status from the body
$data = json_decode(file_get_contents("php://input"), true);
$status = isset($data['status']) ? $data['status'] : null;

// Check if both title and status are provided
if (empty($title) || empty($status)) {
    echo json_encode(["error" => "Video title and status are required"]);
    exit;
}

// Assuming you are using MongoDB
require_once __DIR__ . '/../vendor/autoload.php';  // Adjust the path if necessary
use MongoDB\Client;

try {
    $client = new MongoDB\Client("mongodb://localhost:27017");
    $collection = $client->learning->videos;
} catch (Exception $e) {
    echo json_encode(["error" => "Failed to connect to MongoDB: " . $e->getMessage()]);
    exit;
}

// Validate status value
if (!in_array($status, ['incomplete', 'in-progress', 'completed'])) {
    echo json_encode(["error" => "Invalid status value"]);
    exit;
}

// Find if the video exists
$video = $collection->findOne(['title' => $title]);
if (!$video) {
    echo json_encode(["error" => "Video not found"]);
    exit;
}

// Update video status
$updateResult = $collection->updateOne(
    ['title' => $title],  // Match by title
    ['$set' => ['status' => $status]]  // Update the status field
);

// Check if the update was successful
if ($updateResult->getMatchedCount() > 0 && $updateResult->getModifiedCount() > 0) {
    echo json_encode(["message" => "Video status updated successfully"]);
} elseif ($updateResult->getMatchedCount() > 0) {
    echo json_encode(["message" => "Video status is already up to date"]);
} else {
    echo json_encode(["message" => "No video found with the specified title"]);
}
?>


