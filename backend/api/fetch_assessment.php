<?php
// CORS Headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
require_once __DIR__ . '/../vendor/autoload.php';  // Adjust the path if necessary


$client = new MongoDB\Client("mongodb://localhost:27017");
$database = $client->learning; // Your database name
$collection = $database->assessments; // Your collection name

if (isset($_GET['id'])) {
    $id = $_GET['id'];

    // Find the assessment document based on the ID
    $assessment = $collection->findOne(['assessment_id' => (string)$id]);

    if ($assessment) {
        echo json_encode($assessment); // Return the assessment data
    } else {
        echo json_encode(['error' => 'Assessment not found']);
    }
} else {
    echo json_encode(['error' => 'No assessment ID provided']);
}



// $client = new MongoDB\Client("mongodb://localhost:27017"); // Change if necessary
// $database = $client->learning; // Replace with your database name
// $collection = $database->assessments; // The collection name

// // Capture the assessment_id from the URL
// $assessment_id = isset($_GET['id']) ? $_GET['id'] : null;

// if ($assessment_id) {
//     // Query for assessments with the specific ID
//     $cursor = $collection->find(['assessment_id' => $assessment_id]);

//     // Convert the MongoDB cursor to an array and encode it as JSON
//     $assessments = iterator_to_array($cursor);

//     // Set the content type header to application/json
//     header('Content-Type: application/json');

//     // Return the assessments as a JSON response
//     echo json_encode($assessments);
// } else {
//     // If no ID is provided, return an error message
//     echo json_encode(['error' => 'Assessment not found']);
// }
?>
