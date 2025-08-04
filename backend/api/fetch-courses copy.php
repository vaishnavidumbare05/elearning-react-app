
<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}
// Include MongoDB connection (adjust path to your MongoDB connection file)

require_once '../config/db.php';
require_once __DIR__ . '/../vendor/autoload.php';
// Initialize MongoDB client
try {
    $client = new MongoDB\Client("mongodb://localhost:27017"); // Adjust if needed
    $db = $client->learning; // Replace 'your_database_name' with the actual database name
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Failed to connect to MongoDB: " . $e->getMessage()]);
    exit;
}

// Fetch all courses from the database
$coursesCollection = $db->courses;  // 'courses' is your collection name
$courses = $coursesCollection->find([])->toArray(); // Fetch all courses

// Return courses as JSON
echo json_encode(["success" => true, "courses" => $courses]);
?>
