<?php
// header("Access-Control-Allow-Origin: http://localhost:3000");
// header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
// header("Access-Control-Allow-Headers: Content-Type, Authorization");
// header('Content-Type: application/json');

// require_once '../config/db.php'; // Include your DB connection
// require_once __DIR__ . '/../vendor/autoload.php'; // Ensure Composer's autoload is included if you're using MongoDB PHP library

// // Log all incoming headers for debugging
// $headers = getallheaders();
// file_put_contents('php://stderr', "Incoming headers: " . json_encode($headers) . "\n");

// // Check if Content-Type is set
// if (!isset($headers['Content-Type']) || $headers['Content-Type'] !== 'application/json') {
//     echo json_encode(array("status" => "error", "message" => "Content-Type must be application/json"));
//     exit;
// }

// // Get raw POST data
// $jsonData = file_get_contents("php://input");

// // Log the raw data for debugging
// file_put_contents('php://stderr', "Received data: " . $jsonData . "\n");

// // Decode the JSON data into an associative array
// $data = json_decode($jsonData, true);

// // Check if the data is valid
// if ($data === null) {
//     echo json_encode(array("status" => "error", "message" => "Invalid JSON data received"));
//     exit;
// }

// // Check if required fields are present
// if (!isset($data['assessmentId']) || !isset($data['selectedAnswers'])) {
//     echo json_encode(array("status" => "error", "message" => "Missing required fields"));
//     exit;
// }

// // If valid, process data further...
// $assessmentId = $data['assessmentId'];
// $selectedAnswers = $data['selectedAnswers'];

// // Output received data for debugging
// file_put_contents('php://stderr', "Processed Data: Assessment ID = $assessmentId, Answers = " . json_encode($selectedAnswers) . "\n");

// // Fetch correct answers from the database or a predefined list
// $correctAnswersArray = getCorrectAnswers($assessmentId); // Function to fetch or calculate correct answers

// // Calculate the result by comparing selected answers with correct answers
// $score = 0;
// $totalQuestions = count($correctAnswersArray);
// $incorrectAnswers = []; // Store incorrect answers

// foreach ($selectedAnswers as $questionId => $answer) {
//     if (isset($correctAnswersArray[$questionId])) {
//         if ($correctAnswersArray[$questionId] === $answer) {
//             $score++;
//         } else {
//             // If the answer is incorrect, store the question ID and the correct answer
//             $incorrectAnswers[$questionId] = [
//                 'yourAnswer' => $answer,
//                 'correctAnswer' => $correctAnswersArray[$questionId]
//             ];
//         }
//     }
// }

// // Calculate the score percentage
// $percentageScore = ($totalQuestions > 0) ? ($score / $totalQuestions) * 100 : 0;

// // Prepare a clean result summary with correct answers included
// $resultSummary = [
//     'status' => 'success',
//     'message' => 'Data processed successfully',
//     'score' => $score,  // Display score out of total questions
//     'totalQuestions' => $totalQuestions,
//     'percentageScore' => round($percentageScore, 2), // Include percentage score rounded to 2 decimal places
//     'resultSummary' => "You answered $score out of $totalQuestions questions correctly.",
//     'correctAnswers' => $correctAnswersArray, // Include correct answers in the response
//     'incorrectAnswers' => $incorrectAnswers // Optionally, you can include incorrect answers as well
// ];

// // Store result in MongoDB collection
// try {
//     // Initialize MongoDB Client
//     $client = new MongoDB\Client("mongodb://localhost:27017"); // MongoDB connection string (adjust if needed)
    
//     // Select the database and collection
//     $db = $client->learning;  // Database name is 'learning'
//     $collection = $db->assessment_results; // Replace 'assessment_results' with your desired collection name

//     // Prepare the result data to be inserted
//     $resultData = [
//         'assessmentId' => $assessmentId,
//         'score' => $score,
//         'totalQuestions' => $totalQuestions,
//         'percentageScore' => round($percentageScore, 2), // Store the percentage score
//         'incorrectAnswers' => $incorrectAnswers,
//         'timestamp' => new MongoDB\BSON\UTCDateTime()  // Store timestamp of when the data was processed
//     ];

//     // Insert result into MongoDB collection
//     $collection->insertOne($resultData);

//     file_put_contents('php://stderr', "Data stored in MongoDB successfully.\n");

// } catch (Exception $e) {
//     // If there is an error during insert
//     file_put_contents('php://stderr', "Error storing data in MongoDB: " . $e->getMessage() . "\n");
//     echo json_encode(["status" => "error", "message" => "Failed to store data in MongoDB"]);
//     exit;
// }

// // Output the response as JSON
// echo json_encode($resultSummary);

// // Helper function to get correct answers (mock example, replace with actual database logic)
// function getCorrectAnswers($assessmentId) {
//     // Initialize MongoDB Client
//     $client = new MongoDB\Client("mongodb://localhost:27017"); // MongoDB connection string

//     // Select the database and collection
//     $db = $client->learning; // Database name is 'learning'
//     $collection = $db->assessments; // Replace 'assessments' with the collection where your assessments are stored

//     // Fetch the assessment document for the given assessmentId
//     $assessment = $collection->findOne(['_id' => new MongoDB\BSON\ObjectId($assessmentId)]);

//     // If assessment is found, extract the correct answers
//     if ($assessment) {
//         $correctAnswers = [];
        
//         // Loop through questions to collect correct answers
//         foreach ($assessment['questions'] as $question) {
//             $correctAnswers[$question['_id']->__toString()] = $question['correct_answer'];
//         }

//         return $correctAnswers;
//     } else {
//         return []; // Return an empty array if no assessment found
//     }
// }




header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

require_once '../config/db.php'; // Include your DB connection
require_once __DIR__ . '/../vendor/autoload.php'; // Ensure Composer's autoload is included if you're using MongoDB PHP library

// Log all incoming headers for debugging
$headers = getallheaders();
file_put_contents('php://stderr', "Incoming headers: " . json_encode($headers) . "\n");

// Check if Content-Type is set
if (!isset($headers['Content-Type']) || $headers['Content-Type'] !== 'application/json') {
    echo json_encode(array("status" => "error", "message" => "Content-Type must be application/json"));
    exit;
}

// Get raw POST data
$jsonData = file_get_contents("php://input");

// Log the raw data for debugging
file_put_contents('php://stderr', "Received data: " . $jsonData . "\n");

// Decode the JSON data into an associative array
$data = json_decode($jsonData, true);

// Check if the data is valid
if ($data === null) {
    echo json_encode(array("status" => "error", "message" => "Invalid JSON data received"));
    exit;
}

// Check if required fields are present
if (!isset($data['assessmentId']) || !isset($data['selectedAnswers'])) {
    echo json_encode(array("status" => "error", "message" => "Missing required fields"));
    exit;
}

$assessmentId = $data['assessmentId'];
$selectedAnswers = $data['selectedAnswers'];

// Output received data for debugging
file_put_contents('php://stderr', "Processed Data: Assessment ID = $assessmentId, Answers = " . json_encode($selectedAnswers) . "\n");

// Check if the assessment has already been submitted (exists in database)
$assessmentAlreadyExists = checkIfAssessmentExists($assessmentId);

if ($assessmentAlreadyExists) {
    // If assessment already exists in the database, return an error message
    echo json_encode(array("status" => "error", "message" => "Assessment already submitted"));
    exit;
}

// Fetch correct answers from the database or a predefined list
$correctAnswersArray = getCorrectAnswers($assessmentId); // Function to fetch or calculate correct answers

// Check if correctAnswersArray is empty
if (empty($correctAnswersArray)) {
    echo json_encode(array("status" => "error", "message" => "No questions found for the provided assessmentId"));
    exit;
}

// Calculate the result by comparing selected answers with correct answers
$score = 0;
$totalQuestions = count($correctAnswersArray);
$incorrectAnswers = []; // Store incorrect answers

foreach ($selectedAnswers as $questionId => $answer) {
    if (isset($correctAnswersArray[$questionId])) {
        if ($correctAnswersArray[$questionId] === $answer) {
            $score++;
        } else {
            // If the answer is incorrect, store the question ID and the correct answer
            $incorrectAnswers[$questionId] = [
                'yourAnswer' => $answer,
                'correctAnswer' => $correctAnswersArray[$questionId]
            ];
        }
    }
}

// Calculate the score percentage
$percentageScore = ($totalQuestions > 0) ? ($score / $totalQuestions) * 100 : 0;

// Prepare a clean result summary with correct answers included
$resultSummary = [
    'status' => 'success',
    'message' => 'Data processed successfully',
    'score' => $score,  // Display score out of total questions
    'totalQuestions' => $totalQuestions,
    'percentageScore' => round($percentageScore, 2), // Include percentage score rounded to 2 decimal places
    'resultSummary' => "You answered $score out of $totalQuestions questions correctly.",
    'correctAnswers' => $correctAnswersArray, // Include correct answers in the response
    'incorrectAnswers' => $incorrectAnswers // Optionally, you can include incorrect answers as well
];

// Store result in MongoDB collection
try {
    // Initialize MongoDB Client once at the beginning
    $client = new MongoDB\Client("mongodb://localhost:27017"); // MongoDB connection string (adjust if needed)
    
    // Select the database and collection
    $db = $client->learning;  // Database name is 'learning'
    $collection = $db->assessment_results; // Replace 'assessment_results' with your desired collection name

    // Prepare the result data to be inserted
    $resultData = [
        'assessmentId' => $assessmentId,
        'score' => $score,
        'totalQuestions' => $totalQuestions,
        'percentageScore' => round($percentageScore, 2), // Store the percentage score
        'incorrectAnswers' => $incorrectAnswers,
        'timestamp' => new MongoDB\BSON\UTCDateTime(),  // Store timestamp of when the data was processed
        'status' => 'completed'  // Add the status field and set it to 'completed'
    ];

    // Insert result into MongoDB collection
    $collection->insertOne($resultData);

    file_put_contents('php://stderr', "Data stored in MongoDB successfully.\n");
    $updateResult = $collection->updateOne(
        ['assessmentId' => $assessmentId], // Match the assessment document by 'assessmentId'
        ['$set' => ['status' => 'completed']] // Update the 'status' to 'inactive'
    );
    file_put_contents('php://stderr', "Updated status to 'inactive' for assessmentId: $assessmentId\n");

} catch (Exception $e) {
    // If there is an error during insert
    file_put_contents('php://stderr', "Error storing data in MongoDB: " . $e->getMessage() . "\n");
    echo json_encode(["status" => "error", "message" => "Failed to store data in MongoDB"]);
    exit;
}

// Output the response as JSON
echo json_encode($resultSummary);

// Helper function to check if the assessment already exists
function checkIfAssessmentExists($assessmentId) {
    // Initialize MongoDB Client once at the beginning
    $client = new MongoDB\Client("mongodb://localhost:27017"); // MongoDB connection string

    // Select the database and collection
    $db = $client->learning; // Database name is 'learning'
    $collection = $db->assessment_results; // Collection where results are stored

    // Check if there's already an entry with the same assessmentId
    $existingAssessment = $collection->findOne(['assessmentId' => $assessmentId]);

    // If assessmentId exists, return true, otherwise false
    return $existingAssessment !== null;
}

// Helper function to get correct answers (mock example, replace with actual database logic)
function getCorrectAnswers($assessmentId) {
    // Initialize MongoDB Client once at the beginning
    $client = new MongoDB\Client("mongodb://localhost:27017"); // MongoDB connection string

    // Select the database and collection
    $db = $client->learning; // Database name is 'learning'
    $collection = $db->assessments; // Replace 'assessments' with the collection where your assessments are stored

    // Fetch all questions for the given assessmentId
    $cursor = $collection->find(['assessment_id' => $assessmentId]);

    // Convert the cursor to an array to avoid cursor rewind issues
    $questions = iterator_to_array($cursor);

    // Log the fetched questions for debugging
    file_put_contents('php://stderr', "Fetched questions: " . json_encode($questions) . "\n");

    // Check if we got questions for the assessment
    if (!empty($questions)) {
        $correctAnswers = [];

        // Loop through the fetched questions and get correct answers dynamically
        foreach ($questions as $question) {
            $correctAnswers[(string)$question['_id']] = $question['answer']; // Use '_id' as the question identifier
        }

        return $correctAnswers;
    } else {
        file_put_contents('php://stderr', "No questions found for assessmentId: $assessmentId\n");
        return []; // Return an empty array if no questions or assessment found
    }
}
?>