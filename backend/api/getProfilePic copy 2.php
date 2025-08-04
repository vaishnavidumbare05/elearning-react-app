<?php

session_start();  // Start the session

// header("Access-Control-Allow-Origin: http://localhost:3000");
// header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
// header("Access-Control-Allow-Headers: Content-Type, Authorization");
// header('Content-Type: application/json');
// header("Access-Control-Allow-Credentials: true");  

// require_once '../config/db.php';
// require_once __DIR__ . '/../vendor/autoload.php';

// use MongoDB\Client;

// // Create MongoDB client and select the database and collection
// $client = new Client("mongodb://localhost:27017");
// $database = $client->learning;
// $usersCollection = $database->users;

// // Check if user_id exists in session
// if (!isset($_SESSION['user_id'])) {
//     echo json_encode(['error' => 'User not found in session']);
//     exit;  // Exit if no user is found in session
// }

// // Get the user ID from the session
// $userId = $_SESSION['user_id'];

// // Ensure the user_id is a valid MongoDB ObjectId format (24 hex characters)
// if (!preg_match('/^[a-fA-F0-9]{24}$/', $userId)) {
//     echo json_encode(['error' => 'Invalid user ID format']);
//     exit;  // Exit if the user ID format is invalid
// }

// try {
//     // Fetch the user data from MongoDB
//     $user = $usersCollection->findOne(['_id' => new \MongoDB\BSON\ObjectId($userId)]);

//     // Check if the user was found
//     if ($user) {
//         // Check if profile_pic exists and is not empty
//         $profilePic = isset($user['profile_pic']) && !empty($user['profile_pic'])
//             ? 'http://localhost/backend/uploads/profile_pics/' . $user['profile_pic']
//             : 'http://localhost/backend/uploads/profile_pics/avatar.png';

//         // Return the profile_pic URL in the JSON response
//         echo json_encode(['profile_pic' => $profilePic]);
//     } else {
//         echo json_encode(['error' => 'User not found in database']);
//     }

// } catch (Exception $e) {
//     // Catch any MongoDB or other exceptions and return an error message
//     echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
// }



header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

require_once '../config/db.php';
require_once __DIR__ . '/../vendor/autoload.php';

use MongoDB\Client;

$client = new MongoDB\Client("mongodb://localhost:27017");
$database = $client->learning;
$collection = $database->users;

$user_id = isset($_GET['user_id']) ? $_GET['user_id'] : '';

if (!$user_id) {
    echo json_encode(['error' => 'User ID is missing']);
    exit;
}

$document = $collection->findOne(['_id' => new MongoDB\BSON\ObjectID($user_id)]);

if ($document) {
    // Log the user document to check if profile_pic exists
    error_log("User data: " . print_r($document, true));

    $profilePic = $document['profile_pic'] ?? null;

    if ($profilePic) {
        echo json_encode(['profile_pic' => $profilePic]);
    } else {
        echo json_encode(['profile_pic' => null]);
    }
} else {
    echo json_encode(['error' => 'User not found']);
}
?>
