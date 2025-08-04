<?php
header("Access-Control-Allow-Origin: http://localhost:3000"); // Allow requests from frontend (localhost:3000)
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE"); // Allow HTTP methods
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Allow headers like Content-Type and Authorization
// Handle preflight requests (OPTIONS method)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0); // Respond with a 200 status for OPTIONS request (preflight)
}
// Include MongoDB Client
require_once __DIR__ . '/../vendor/autoload.php';  // Adjust the path if necessary




// use MongoDB\Client;

// // Get the raw POST data
// $jsonData = file_get_contents('php://input');

// // Check if data is null or empty
// if (!$jsonData) {
//     echo json_encode(['status' => 'error', 'message' => 'No data received']);
//     exit();
// }

// // Decode the JSON data
// $data = json_decode($jsonData, true);

// // Check if JSON is decoded correctly
// if ($data === null) {
//     echo json_encode(['status' => 'error', 'message' => 'Invalid JSON received']);
//     exit();
// }

// // MongoDB connection
// $client = new Client("mongodb://localhost:27017"); // Change to your MongoDB URI
// $database = $client->learning; // Database name
// $collection = $database->users; // Collection name

// // Create user_id by combining firstName and lastName
// $user_id = $data['firstName'] . ' ' . $data['lastName'];

// // Prepare user data
// $userData = [
//     'user_id' => $user_id,
//     'firstName' => $data['firstName'],
//     'lastName' => $data['lastName'],
//     'email' => $data['email'],
//     'password' => password_hash($data['password'], PASSWORD_BCRYPT), // Secure password hashing
//     'newsletter' => $data['newsletter']
// ];

// // Insert into the database
// try {
//     $insertResult = $collection->insertOne($userData);
//     echo json_encode(['status' => 'success', 'user_id' => $insertResult->getInsertedId()]);
// } catch (Exception $e) {
//     echo json_encode(['status' => 'error', 'message' => $e->getMessage()]);
// }



header('Content-Type: application/json');

// Disable error reporting output in the response
ini_set('display_errors', 0);
error_reporting(E_ALL);

try {
   include '../config/db.php';// Include MongoDB connection

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        echo json_encode(['success' => false, 'error' => 'Invalid request method.']);
        exit;
    }

    // Collect input data
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($name) || empty($email) || empty($password)) {
        echo json_encode(['success' => false, 'error' => 'All fields are required.']);
        exit;
    }

    // Check MongoDB connection
    $dbInstance = new Database();
    $db = $dbInstance->getDb();
    

    $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

    // Access the 'users' collection
    $collection = $db->users;

    // Check if the email already exists
    $existingUser = $collection->findOne(['email' => $email]);

    if ($existingUser) {
        echo json_encode(['success' => false, 'error' => 'Email already exists.']);
        exit;
    }

    // Insert the new user
    $result = $collection->insertOne([
        'name' => $name,
        'email' => $email,
        'password' => $hashedPassword,
        'created_at' => new MongoDB\BSON\UTCDateTime(),
    ]);

    if ($result->getInsertedCount() > 0) {
        echo json_encode(['success' => true]);
    } else {
        echo json_encode(['success' => false, 'error' => 'Registration failed.']);
    }
} catch (Throwable $e) {
    // Handle unexpected errors
    echo json_encode(['success' => false, 'error' => 'Internal server error.', 'details' => $e->getMessage()]);
    // Log the error (optional, for debugging)
    error_log($e->getMessage());
}






// ini_set('display_errors', 1);
// error_reporting(E_ALL);

// header("Access-Control-Allow-Origin: http://localhost:3000");
// header("Access-Control-Allow-Methods: POST, OPTIONS");
// header("Access-Control-Allow-Headers: Content-Type");
// header('Content-Type: application/json');

// require_once '../config/db.php';

// try {
//     $database = new Database();
//     $usersCollection = $database->getCollection('users');

//     if ($_SERVER['REQUEST_METHOD'] === 'POST') {
//         $first_name = $_POST['first_name'] ?? null;
//         $last_name = $_POST['last_name'] ?? null;
//         $email = $_POST['email'] ?? null;
//         $password = password_hash($_POST['password'] ?? '', PASSWORD_BCRYPT);

//         if (!$first_name || !$last_name || !$email || !$password) {
//             echo json_encode(['error' => 'All fields are required.']);
//             exit;
//         }

//         // Generate the user_id based on first and last name
//         $user_id = strtolower($first_name . '' . $last_name);

//         $usersCollection->insertOne([
//             'first_name' => $first_name,
//             'last_name' => $last_name,
//             'email' => $email,
//             'password' => $password,
//             'user_id' => $user_id, // Store only first and last name in user_id
//         ]);

//         echo json_encode(['success' => 'Registration successful']);
//     } else {
//         echo json_encode(['error' => 'Invalid request method']);
//     }
// } catch (Exception $e) {
//     echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
// }

// ?>
