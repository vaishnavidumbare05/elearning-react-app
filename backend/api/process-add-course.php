<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Content-Type: application/json");

require_once "../config/db.php"; // Include DB connection

// Initialize Database connection
$database = new Database();
$db = $database->getDb();

// Validate database connection
if (!$db) {
    die(json_encode(["success" => false, "message" => "Database connection failed!"]));
}

// Read JSON input properly (handle both JSON and POST)
$data = json_decode(file_get_contents("php://input"), true);
if (!$data) {
    $data = $_POST; // Fallback to $_POST if JSON input is empty
}

// Log incoming data for debugging
file_put_contents("log.txt", "Received Data: " . json_encode($data) . "\n", FILE_APPEND);

// Validate required fields (excluding video URL, which is handled separately)
if (empty($data["title"]) || empty($data["duration"]) || empty($data["status"])) {
    echo json_encode(["success" => false, "message" => "Invalid input: Missing fields", "received_data" => $data]);
    exit();
}

// Handle video upload
$videoUrl = "";
if (isset($_FILES['videoUpload']) && $_FILES['videoUpload']['error'] == UPLOAD_ERR_OK) {
    // Define the directory to save the uploaded video
    $uploadDir = 'uploads/videos/';  // Change this path if needed
    $uploadFile = $uploadDir . basename($_FILES['videoUpload']['name']);

    // Create the directory if it does not exist
    if (!is_dir($uploadDir)) {
        mkdir($uploadDir, 0777, true);  // Create directory with proper permissions
    }

    // Move the uploaded file to the target directory
    if (move_uploaded_file($_FILES['videoUpload']['tmp_name'], $uploadFile)) {
        $videoUrl = 'http://localhost/' . $uploadFile; // The URL to store in the database
    } else {
        echo json_encode(["success" => false, "message" => "File upload failed"]);
        exit();
    }
} else {
    echo json_encode(["success" => false, "message" => "No file uploaded or error in file upload"]);
    exit();
}

// Assign other form data
$title = trim($data["title"]);
$duration = trim($data["duration"]);
$status = trim($data["status"]);

// Reference MongoDB collection for course details
$collection = $db->course_details; // Assuming course details go into 'course_details' collection

// Insert course details with video URL
$insertResult = $collection->insertOne([
    "title" => $title,
    "duration" => $duration,
    "status" => $status,
    "videoUrl" => $videoUrl  // Store the video URL in the database
]);

// Check insertion status
if ($insertResult->getInsertedCount() > 0) {
    echo json_encode(["success" => true, "message" => "Course details added successfully"]);
} else {
    echo json_encode(["success" => false, "message" => "Failed to add course details"]);
}
?>
