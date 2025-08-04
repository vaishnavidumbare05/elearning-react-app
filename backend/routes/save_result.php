<?php


// header("Access-Control-Allow-Origin: http://localhost:3000");
// header("Access-Control-Allow-Methods: POST");
// header("Access-Control-Allow-Headers: Content-Type");
// header('Content-Type: application/json');

// require_once '../config/db.php';
// require_once __DIR__ . '/../vendor/autoload.php';

// $client = new MongoDB\Client("mongodb://localhost:27017");
// $resultsCollection = $client->learning->assessment_soft_results;
// $questionsCollection = $client->learning->assessmentsoft;


// // Create a new instance of the Database class
// $db = new Database();

// // Get the 'assessment_results' collection from the database
// $resultsCollection = $db->getCollection('assessment_results');

// // Get and decode the JSON input
// $data = json_decode(file_get_contents('php://input'), true);

// // Validate incoming data
// if ($data === null) {
//     echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
//     exit;
// }

// if (!isset($data['assessment_id']) || !isset($data['user_answers'])) {
//     echo json_encode(['success' => false, 'message' => 'Missing required parameters']);
//     exit;
// }

// $assessmentId = $data['assessment_id'];
// $userAnswers = $data['user_answers'];

// // Log the incoming user answers for debugging
// error_log("Received User Answers: " . print_r($userAnswers, true));

// // Query the questions for the given assessment_id
// try {
//     $questions = $questionsCollection->find(['assessment_id' => $assessmentId]);
//     $questionsArray = iterator_to_array($questions);
// } catch (Exception $e) {
//     error_log("Error fetching questions from database: " . $e->getMessage());
//     echo json_encode(['success' => false, 'message' => 'Error fetching questions']);
//     exit;
// }

// $totalQuestions = count($questionsArray);
// $score = 0;
// $incorrectAnswers = [];
// $incorrectQuestionDetails = [];
// $correctAnswers = [];

// foreach ($questionsArray as $question) {
//     $questionId = (string) $question['_id'];
//     $correctAnswer = $question['answer'] ?? null;
//     $questionText = $question['question'] ?? null;

//     $correctAnswers[$questionId] = $correctAnswer;

//     // Check if the user provided an answer for the question
//     if (isset($userAnswers[$questionId])) {
//         $userAnswer = strtolower(trim($userAnswers[$questionId]));
//         $correctAnswer = strtolower(trim($correctAnswer));

//         // Compare user answer with correct answer
//         if ($userAnswer === $correctAnswer) {
//             $score++;
//         } else {
//             $incorrectAnswers[] = $questionId;
//             $incorrectQuestionDetails[] = [
//                 'questionId' => $questionId,
//                 'text' => $questionText,
//                 'correctAnswer' => $correctAnswer,
//                 'userAnswer' => $userAnswer,
//             ];
//         }
//     } else {
//         // If no answer was provided, add it as incorrect
//         $incorrectAnswers[] = $questionId;
//         $incorrectQuestionDetails[] = [
//             'questionId' => $questionId,
//             'text' => $questionText,
//             'correctAnswer' => $correctAnswer,
//             'userAnswer' => 'Not answered',
//         ];
//     }
// }

// // Calculate the percentage score
// $percentageScore = $totalQuestions > 0 ? ($score / $totalQuestions) * 100 : 0;

// // Determine Pass/Fail status based on score
// $status = $percentageScore >= 50 ? 'Pass' : 'Fail';

// // Prepare the response
// $response = [
//     'success' => true,
//     'result' => [
//         'score' => $score,
//         'totalQuestions' => $totalQuestions,
//         'percentageScore' => $percentageScore,
//         'status' => $status,
//         'incorrectAnswers' => $incorrectAnswers,
//         'incorrectQuestionDetails' => $incorrectQuestionDetails,
//         'correctAnswers' => $correctAnswers,
//     ],
// ];

// // Save the result to the database
// try {
//     $resultData = [
//         'assessment_id' => $assessmentId,
//         'score' => $score,
//         'status' => $status,
//         'incorrectAnswers' => $incorrectAnswers,
//         'incorrectQuestionDetails' => $incorrectQuestionDetails,
//         'user_answers' => $userAnswers,  // Optionally, save the user's answers as well
//         'created_at' => new MongoDB\BSON\UTCDateTime(),  // Timestamp of when the result was saved
//     ];

//     // Insert or update the result in the database
//     $resultsCollection->updateOne(
//         ['assessment_id' => $assessmentId],  // Use the assessment_id to match the record
//         ['$set' => $resultData],  // Update the result
//         ['upsert' => true]  // If the record doesn't exist, insert a new one
//     );
// } catch (Exception $e) {
//     error_log("Error saving the result to the database: " . $e->getMessage());
//     echo json_encode(['success' => false, 'message' => 'Error saving the result to the database']);
//     exit;
// }

// // Send the response back to the client
// echo json_encode($response);






// header("Access-Control-Allow-Origin: http://localhost:3000");
// header("Access-Control-Allow-Methods: POST");
// header("Access-Control-Allow-Headers: Content-Type");
// header('Content-Type: application/json');

// require_once '../config/db.php';
// require_once __DIR__ . '/../vendor/autoload.php';

// $client = new MongoDB\Client("mongodb://localhost:27017");
// $resultsCollection = $client->learning->assessment_soft_results;
// $questionsCollection = $client->learning->assessmentsoft;

// // Create a new instance of the Database class
// $db = new Database();

// // Get the 'assessment_results' collection from the database
// $resultsCollection = $db->getCollection('assessment_results');
// $softResultsCollection = $db->getCollection('assessment_soft_results'); // Added the second collection

// // Get and decode the JSON input
// $data = json_decode(file_get_contents('php://input'), true);

// // Validate incoming data
// if ($data === null) {
//     echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
//     exit;
// }

// if (!isset($data['assessment_id']) || !isset($data['user_answers'])) {
//     echo json_encode(['success' => false, 'message' => 'Missing required parameters']);
//     exit;
// }

// $assessmentId = $data['assessment_id'];
// $userAnswers = $data['user_answers'];

// // Log the incoming user answers for debugging
// error_log("Received User Answers: " . print_r($userAnswers, true));

// // Query the questions for the given assessment_id
// try {
//     $questions = $questionsCollection->find(['assessment_id' => $assessmentId]);
//     $questionsArray = iterator_to_array($questions);
// } catch (Exception $e) {
//     error_log("Error fetching questions from database: " . $e->getMessage());
//     echo json_encode(['success' => false, 'message' => 'Error fetching questions']);
//     exit;
// }

// $totalQuestions = count($questionsArray);
// $score = 0;
// $incorrectAnswers = [];
// $incorrectQuestionDetails = [];
// $correctAnswers = [];

// foreach ($questionsArray as $question) {
//     $questionId = (string) $question['_id'];
//     $correctAnswer = $question['answer'] ?? null;
//     $questionText = $question['question'] ?? null;

//     $correctAnswers[$questionId] = $correctAnswer;

//     // Check if the user provided an answer for the question
//     if (isset($userAnswers[$questionId])) {
//         $userAnswer = strtolower(trim($userAnswers[$questionId]));
//         $correctAnswer = strtolower(trim($correctAnswer));

//         // Compare user answer with correct answer
//         if ($userAnswer === $correctAnswer) {
//             $score++;
//         } else {
//             $incorrectAnswers[] = $questionId;
//             $incorrectQuestionDetails[] = [
//                 'questionId' => $questionId,
//                 'text' => $questionText,
//                 'correctAnswer' => $correctAnswer,
//                 'userAnswer' => $userAnswer,
//             ];
//         }
//     } else {
//         // If no answer was provided, add it as incorrect
//         $incorrectAnswers[] = $questionId;
//         $incorrectQuestionDetails[] = [
//             'questionId' => $questionId,
//             'text' => $questionText,
//             'correctAnswer' => $correctAnswer,
//             'userAnswer' => 'Not answered',
//         ];
//     }
// }

// // Calculate the percentage score
// $percentageScore = $totalQuestions > 0 ? ($score / $totalQuestions) * 100 : 0;

// // Set the status to "completed"
// $status = 'completed';  // Changed from pass/fail to completed

// // Prepare the response
// $response = [
//     'success' => true,
//     'result' => [
//         'score' => $score,
//         'totalQuestions' => $totalQuestions,
//         'percentageScore' => $percentageScore,
//         'status' => $status,
//         'incorrectAnswers' => $incorrectAnswers,
//         'incorrectQuestionDetails' => $incorrectQuestionDetails,
//         'correctAnswers' => $correctAnswers,
//     ],
// ];

// // Save the result to the database (both collections)
// try {
//     $resultData = [
//         'assessment_id' => $assessmentId,
//         'score' => $score,
//         'status' => $status,  // Now 'completed' status is saved
//         'incorrectAnswers' => $incorrectAnswers,
//         'incorrectQuestionDetails' => $incorrectQuestionDetails,
//         'user_answers' => $userAnswers,  // Optionally, save the user's answers as well
//         'created_at' => new MongoDB\BSON\UTCDateTime(),  // Timestamp of when the result was saved
//     ];

//     // Insert or update the result in the 'assessment_results' collection
//     $resultsCollection->updateOne(
//         ['assessment_id' => $assessmentId],  // Use the assessment_id to match the record
//         ['$set' => $resultData],  // Update the result
//         ['upsert' => true]  // If the record doesn't exist, insert a new one
//     );

//     // Insert or update the result in the 'assessment_soft_results' collection (second collection)
//     $softResultsCollection->updateOne(
//         ['assessment_id' => $assessmentId],  // Use the assessment_id to match the record
//         ['$set' => $resultData],  // Update the result
//         ['upsert' => true]  // If the record doesn't exist, insert a new one
//     );
// } catch (Exception $e) {
//     error_log("Error saving the result to the database: " . $e->getMessage());
//     echo json_encode(['success' => false, 'message' => 'Error saving the result to the database']);
//     exit;
// }

// // Send the response back to the client
// echo json_encode($response);


header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");
header('Content-Type: application/json');

require_once '../config/db.php';
require_once __DIR__ . '/../vendor/autoload.php';

$client = new MongoDB\Client("mongodb://localhost:27017");
$resultsCollection = $client->learning->assessment_soft_results;
$questionsCollection = $client->learning->assessmentsoft;

// Create a new instance of the Database class
$db = new Database();

// Get the 'assessment_results' collection from the database
$assessmentResultsCollection = $db->getCollection('assessment_results');
$softResultsCollection = $db->getCollection('assessment_soft_results'); // Added the second collection

// Get and decode the JSON input
$data = json_decode(file_get_contents('php://input'), true);

// Validate incoming data
if ($data === null) {
    echo json_encode(['success' => false, 'message' => 'Invalid JSON input']);
    exit;
}

if (!isset($data['assessment_id']) || !isset($data['user_answers'])) {
    echo json_encode(['success' => false, 'message' => 'Missing required parameters']);
    exit;
}

$assessmentId = $data['assessment_id'];
$userAnswers = $data['user_answers'];

// Log the incoming user answers for debugging
error_log("Received User Answers: " . print_r($userAnswers, true));

// Query the questions for the given assessment_id
try {
    $questions = $questionsCollection->find(['assessment_id' => $assessmentId]);
    $questionsArray = iterator_to_array($questions);
} catch (Exception $e) {
    error_log("Error fetching questions from database: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error fetching questions']);
    exit;
}

$totalQuestions = count($questionsArray);
$score = 0;
$incorrectAnswers = [];
$incorrectQuestionDetails = [];
$correctAnswers = [];

foreach ($questionsArray as $question) {
    $questionId = (string) $question['_id'];
    $correctAnswer = $question['answer'] ?? null;
    $questionText = $question['question'] ?? null;

    $correctAnswers[$questionId] = $correctAnswer;

    // Check if the user provided an answer for the question
    if (isset($userAnswers[$questionId])) {
        $userAnswer = strtolower(trim($userAnswers[$questionId]));
        $correctAnswer = strtolower(trim($correctAnswer));

        // Compare user answer with correct answer
        if ($userAnswer === $correctAnswer) {
            $score++;
        } else {
            $incorrectAnswers[] = $questionId;
            $incorrectQuestionDetails[] = [
                'questionId' => $questionId,
                'text' => $questionText,
                'correctAnswer' => $correctAnswer,
                'userAnswer' => $userAnswer,
            ];
        }
    } else {
        // If no answer was provided, add it as incorrect
        $incorrectAnswers[] = $questionId;
        $incorrectQuestionDetails[] = [
            'questionId' => $questionId,
            'text' => $questionText,
            'correctAnswer' => $correctAnswer,
            'userAnswer' => 'Not answered',
        ];
    }
}

// Calculate the percentage score
$percentageScore = $totalQuestions > 0 ? ($score / $totalQuestions) * 100 : 0;

// Set the status to "completed"
$status = 'completed';  // Changed from pass/fail to completed

// Prepare the response
$response = [
    'success' => true,
    'message' => 'Assessment result saved successfully',
    'result' => [
        'score' => $score,
        'totalQuestions' => $totalQuestions,
        'percentageScore' => $percentageScore,
        'status' => $status,
        'incorrectAnswers' => $incorrectAnswers,
        'incorrectQuestionDetails' => $incorrectQuestionDetails,
        'correctAnswers' => $correctAnswers,
    ],
];

// Save the result to the database (both collections)
try {
    $resultData = [
        'assessment_id' => $assessmentId,
        'score' => $score,
        'status' => $status,  // Now 'completed' status is saved
        'incorrectAnswers' => $incorrectAnswers,
        'incorrectQuestionDetails' => $incorrectQuestionDetails,
        'user_answers' => $userAnswers,  // Optionally, save the user's answers as well
        'created_at' => new MongoDB\BSON\UTCDateTime(),  // Timestamp of when the result was saved
    ];

    // Insert or update the result in the 'assessment_results' collection
    $assessmentResultsCollection->updateOne(
        ['assessment_id' => $assessmentId],  // Use the assessment_id to match the record
        ['$set' => $resultData],  // Update the result
        ['upsert' => true]  // If the record doesn't exist, insert a new one
    );

    // Insert or update the result in the 'assessment_soft_results' collection (second collection)
    $softResultsCollection->updateOne(
        ['assessment_id' => $assessmentId],  // Use the assessment_id to match the record
        ['$set' => $resultData],  // Update the result
        ['upsert' => true]  // If the record doesn't exist, insert a new one
    );
} catch (Exception $e) {
    error_log("Error saving the result to the database: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'Error saving the result to the database']);
    exit;
}

// Send the response back to the client
echo json_encode($response);
