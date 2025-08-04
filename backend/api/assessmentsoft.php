<?php
// // CORS headers
// header("Access-Control-Allow-Origin: *");
// header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
// header("Access-Control-Allow-Headers: Content-Type, Authorization");
// require_once __DIR__ . '/../vendor/autoload.php';  // Ensure this path is correct

// // If it's a preflight request (OPTIONS), return a 200 status code
// if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
//     exit(0);
// }

// // Database connection
// require_once __DIR__ . '/../config/db.php';  // Ensure this path is correct

// // Function to fetch assessments for Software Development course
// function getSoftwareDevelopmentAssessments() {
//     global $db;  // Use the MongoDB instance

//     // Assuming 'assessments' is the collection where assessments are stored
//     $course_id = 1;  // Adjust as needed based on your database
//     $collection = $db->assessments;  // Get the 'assessments' collection
    
//     // Query to fetch assessments for Software Developer course (course_id = 1)
//     $query = ['course_id' => $course_id];
//     $cursor = $collection->find($query);

//     $assessments = [];
//     foreach ($cursor as $document) {
//         $assessments[] = $document;
//     }

//     return $assessments;
// }

// // Fetch the assessments
// $assessments = getSoftwareDevelopmentAssessments();

// // Return the assessments as a JSON response
// echo json_encode($assessments);



header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

require_once '../config/db.php';

$client = new MongoDB\Client("mongodb://localhost:27017"); // Change if necessary
$database = $client->learning; // Replace with your database name
$collection = $database->assessmentsoft; // The collection name

// Capture the assessment_id from the URL
$assessment_id = isset($_GET['id']) ? $_GET['id'] : null;

if ($assessment_id) {
    // Query for assessments with the specific ID
    $cursor = $collection->find(['assessment_id' => $assessment_id]);

    // Convert the MongoDB cursor to an array
    $assessments = iterator_to_array($cursor);

    // Check if we found any assessments
    if (count($assessments) > 0) {
        echo json_encode($assessments); // Return the assessments as a JSON response
    } else {
        echo json_encode([]); // Return an empty array if no assessments are found
    }
} else {
    // If no ID is provided, return an empty array
    echo json_encode([]);
}
?>