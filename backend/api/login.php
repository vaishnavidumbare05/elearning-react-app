

<?php
// Allow cross-origin requests (CORS)
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Set content type for JSON responses
header("Content-Type: application/json");

// Include the database configuration and connect to MongoDB
require_once '../config/db.php'; // Ensure the path is correct

// Handle preflight (OPTIONS) requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

try {
    // Initialize the database connection
    $database = new Database();
    $usersCollection = $database->getCollection('users'); // Assuming the 'users' collection

    if ($_SERVER['REQUEST_METHOD'] === 'POST') {
        // Get the raw POST data from the request body
        $inputData = json_decode(file_get_contents('php://input'), true);

        // Debugging log to check the received data
        error_log("Received data: " . print_r($inputData, true)); // Log the received data

        // Extract email and password from the request
        $email = $inputData['email'] ?? null;
        $password = $inputData['password'] ?? null;

        // Validate input: Ensure both email and password are provided
        if (!$email || !$password) {
            echo json_encode(['error' => 'Email and password are required']);
            exit;
        }

        // Query the users collection to find the user by email
        $user = $usersCollection->findOne(['email' => $email]);
        $profilePic = $user['profile_pic'] ?? null;
$profilePicUrl = $profilePic ? "http://localhost/backend/uploads/" . $profilePic : null;

        if ($user && password_verify($password, $user['password'])) {
            // Successful login: Return success response with user details
           echo json_encode([
    'success' => true,
    'user_id' => (string)$user['_id'],
    'name' => $user['name'],
    'email' => $user['email'],
   'profile_pic' => $profilePic,
    'profile_pic_url' => $profilePicUrl,
    'message' => 'Login successful!'
]);
        } else {
            // Authentication failed: Invalid email or password
            echo json_encode(['error' => 'Invalid email or password']);
        }
    } else {
        // Handle unsupported HTTP methods (e.g., GET, PUT, etc.)
        echo json_encode(['error' => 'Invalid request method']);
    }
} catch (Exception $e) {
    // Handle server errors: Return error message in JSON format
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}



?>