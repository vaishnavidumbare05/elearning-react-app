<?php

// // CORS Headers
// header("Access-Control-Allow-Origin: http://localhost:3000");
// header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
// header("Access-Control-Allow-Headers: Content-Type, Authorization");
// header("Access-Control-Allow-Credentials: true");

// if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
//     // Preflight request, no need to proceed further
//     http_response_code(200); // Respond with a 200 status for preflight
//     exit;
// }

// require '../config/db.php'; // Ensure this path is correct

// session_start();
// // var_dump($_SESSION);.


// // Check if the user is authenticated (session exists)
// if (!isset($_SESSION['email'])) {
//     echo json_encode(['error' => 'Not authenticated']);
//     exit;
// }

// $email = $_SESSION['email']; // Assuming the email is stored in the session

// // Initialize the Database class
// $database = new Database();
// $db = $database->getDb();

// try {
//     $usersCollection = $db->users; // Assuming 'users' is your MongoDB collection
//     $user = $usersCollection->findOne(['email' => $email]);

//     if ($user) {
//         // Return user_id based on email
//         echo json_encode(['user_id' => $user['user_id']]);
//     } else {
//         echo json_encode(['error' => 'User not found']);
//     }
// } catch (Exception $e) {
//     echo json_encode(['error' => 'Database query error: ' . $e->getMessage()]);
// }





// CORS Headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    // Preflight request, no need to proceed further
    http_response_code(200); // Respond with a 200 status for preflight
    exit;
}

require '../config/db.php'; // Ensure this path is correct

session_start();

// Check if the user is authenticated (session exists)
if (!isset($_SESSION['email'])) {
    echo json_encode(['error' => 'Not authenticated']);
    exit;
}

$email = $_SESSION['email']; // Assuming the email is stored in the session

// Initialize the Database class
$database = new Database();
$db = $database->getDb();

try {
    $usersCollection = $db->users; // Assuming 'users' is your MongoDB collection
    $user = $usersCollection->findOne(['email' => $email]);

    if ($user) {
        // Ensure we are returning the profile_pic
        $response = [
            'user_id' => $user['user_id'],
            'name' => $user['name'],
            'email' => $user['email'],
            'profile_pic' => isset($user['profile_pic']) ? $user['profile_pic'] : null,
        ];

        echo json_encode($response);
    } else {
        echo json_encode(['error' => 'User not found']);
    }
} catch (Exception $e) {
    echo json_encode(['error' => 'Database query error: ' . $e->getMessage()]);
}
?>


