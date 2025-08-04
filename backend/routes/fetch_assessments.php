<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

// Include the database class
require_once '../config/db.php'; // Ensure the path to db.php is correct

// Instantiate the Database class
$database = new Database();

// Access the 'assessments' collection
$collection = $database->getCollection('assessments');

try {
    // Fetch all assessments from the database
    $assessments = $collection->find()->toArray();

    // Cast each assessment to a regular array
    $assessments = array_map(function($assessment) {
        // Convert MongoDB document to array
        $assessment = (array) $assessment;
        
        // Convert BSONArray to a regular array
        if (isset($assessment['mcq_options'])) {
            $assessment['mcq_options'] = iterator_to_array($assessment['mcq_options']);
        }
        
        return $assessment;
    }, $assessments);

    // Filter assessments if you only want to send the ones with specific ids (1 to 5)
    $filteredAssessments = array_filter($assessments, function($assessment) {
        return isset($assessment['assessment_id']) && in_array($assessment['assessment_id'], ['1', '2', '3', '4', '5']);
    });

    // Return the filtered assessments as JSON
    echo json_encode(array_values($filteredAssessments));
} catch (Exception $e) {
    // Handle any errors
    echo json_encode(['error' => $e->getMessage()]);
}
?>
