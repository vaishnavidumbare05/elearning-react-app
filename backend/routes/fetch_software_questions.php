<?php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

require_once '../config/db.php';
require_once __DIR__ . '/../vendor/autoload.php';

$client = new MongoDB\Client("mongodb://localhost:27017");
$assessmentCollection = $client->learning->assessmentsoft;
$statusCollection = $client->learning->assessment_soft_result;

$id = $_GET['id'] ?? null;

if (!$id) {
    echo json_encode(["error" => "ID is required"]);
    exit;
}

try {
    // Fetch all questions for the given assessment_id
    $questionsCursor = $assessmentCollection->find(['assessment_id' => (string) $id]);
    $questions = iterator_to_array($questionsCursor);

    if (empty($questions)) {
        echo json_encode(["error" => "No questions found for this assessment"]);
        exit;
    }

    // Fetch status from the assessment_soft_result collection
    $statusResult = $statusCollection->findOne(['assessment_id' => (string) $id]);
    $status = $statusResult['status'] ?? 'not-started';

    // Prepare questions for the response, including the MongoDB _id
    $formattedQuestions = array_map(function ($question) {
        return [
            'id' => (string) $question['_id'],  // Include the unique MongoDB _id as 'id'
            'text' => $question['question'] ?? null,
            'options' => $question['mcq_options'] ?? []
        ];
    }, $questions);

    // Return the response
    echo json_encode([
        "success" => true,
        "assessmentId" => $id,
        "questions" => $formattedQuestions,
        "status" => $status
    ]);
} catch (Exception $e) {
    echo json_encode(["error" => "Server error: " . $e->getMessage()]);
}




// header("Access-Control-Allow-Origin: http://localhost:3000");
// header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
// header("Access-Control-Allow-Headers: Content-Type, Authorization");
// header('Content-Type: application/json');

// require_once '../config/db.php';
// require_once __DIR__ . '/../vendor/autoload.php';

// $client = new MongoDB\Client("mongodb://localhost:27017");
// $statusCollection = $client->learning->assessment_soft_result;

// // Default to the 'assessmentsoft' collection
// $assessmentCollection = $client->learning->assessmentsoft;

// $id = $_GET['id'] ?? null;

// if (!$id) {
//     echo json_encode(["error" => "ID is required"]);
//     exit;
// }

// try {
//     // Check if the ID is 5, and if so, fetch from the 'assessments' collection
//     if ($id == "5") {
//         $assessmentCollection = $client->learning->assessments;  // Use the 'assessments' collection for id=5
//     }

//     // Fetch all questions for the given assessment_id
//     $questionsCursor = $assessmentCollection->find(['assessment_id' => (string) $id]);
//     $questions = iterator_to_array($questionsCursor);

//     if (empty($questions)) {
//         echo json_encode(["error" => "No questions found for this assessment"]);
//         exit;
//     }

//     // Fetch status from the assessment_soft_result collection
//     $statusResult = $statusCollection->findOne(['assessment_id' => (string) $id]);
//     $status = $statusResult['status'] ?? 'not-started';

//     // Prepare questions for the response, including the MongoDB _id
//     $formattedQuestions = array_map(function ($question) {
//         return [
//             'id' => (string) $question['_id'],  // Include the unique MongoDB _id as 'id'
//             'text' => $question['question'] ?? null,
//             'options' => $question['mcq_options'] ?? []
//         ];
//     }, $questions);

//     // Return the response
//     echo json_encode([
//         "success" => true,
//         "assessmentId" => $id,
//         "questions" => $formattedQuestions,
//         "status" => $status
//     ]);
// } catch (Exception $e) {
//     echo json_encode(["error" => "Server error: " . $e->getMessage()]);
// }
