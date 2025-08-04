<?php
// MongoDB connection setup
require_once __DIR__ . '/../vendor/autoload.php';  // Adjust the path if necessary
use MongoDB\Client;

// Base URL for accessing videos
$baseURL = 'http://localhost/backend/videos/';  // Define the base URL for storage

// If the form is submitted via POST method
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get form data
    $title = $_POST['title'];
    $duration = $_POST['duration'];
    $status = $_POST['status'];

    // Define upload directory for videos
    $uploadDir = __DIR__ . '/../videos/';  // Path to store the video files

    // Validate the input fields and the uploaded file
    if (!empty($title) && !empty($duration) && !empty($status) && isset($_FILES['video_file']) && $_FILES['video_file']['error'] === UPLOAD_ERR_OK) {
        try {
            // Create MongoDB connection
            $client = new Client("mongodb://localhost:27017");
            $database = $client->learning;  // MongoDB database
            $videoCollection = $database->videos;  // Videos collection

            // Get file details
            $fileTmpPath = $_FILES['video_file']['tmp_name'];
            $fileName = basename($_FILES['video_file']['name']);
            $fileType = $_FILES['video_file']['type'];

            // Set allowed video file types
            $allowedTypes = ['video/mp4', 'video/avi', 'video/mov', 'video/mkv'];

            // Check if the file type is allowed
            if (in_array($fileType, $allowedTypes)) {
                // Generate a unique file name to prevent overwriting
                $newFileName = uniqid() . '_' . $fileName;
                $destPath = $uploadDir . $newFileName;

                // Ensure the upload directory exists
                if (!is_dir($uploadDir)) {
                    mkdir($uploadDir, 0777, true);
                }

                // Move the file to the target directory
                if (move_uploaded_file($fileTmpPath, $destPath)) {
                    // Construct the video URL path to be stored in MongoDB
                    $videoURL = $baseURL . $newFileName;

                    // Prepare video metadata
                    $videoMetadata = [
                        "title" => $title,
                        "duration" => $duration,
                        "status" => $status,
                        "video_url" => $videoURL  // Save the URL path for accessing
                    ];

                    // Insert video metadata into MongoDB
                    $videoCollection->insertOne($videoMetadata);

                    echo "<div class='alert alert-success'>Video uploaded and data inserted successfully!</div>";
                } else {
                    echo "<div class='alert alert-danger'>Error moving the uploaded file.</div>";
                }
            } else {
                echo "<div class='alert alert-warning'>Invalid file type. Only video files are allowed.</div>";
            }
        } catch (Exception $e) {
            echo "<div class='alert alert-danger'>Error: " . $e->getMessage() . "</div>";
        }
    } else {
        echo "<div class='alert alert-warning'>All fields and the video file are required!</div>";
    }
} else {
    // Show the form if not POST method
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Insert Video Data</title>
    <!-- Bootstrap CSS -->
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <h1 class="text-center mb-4">Add Python Video Information</h1>

        <!-- Video form -->
        <form action="insert_video.php" method="POST" enctype="multipart/form-data">
            <div class="form-group">
                <label for="title">Video Title:</label>
                <input type="text" id="title" name="title" class="form-control" required>
            </div>

            <div class="form-group">
                <label for="duration">Duration (e.g., 15:30):</label>
                <input type="text" id="duration" name="duration" class="form-control" required>
            </div>

            <div class="form-group">
                <label for="status">Status (e.g., active/inactive):</label>
                <input type="text" id="status" name="status" class="form-control" required>
            </div>

            <div class="form-group">
                <label for="video_file">Upload Video:</label>
                <input type="file" id="video_file" name="video_file" class="form-control-file" accept="video/*" required>
            </div>

            <div class="form-group text-center">
                <button type="submit" class="btn btn-primary">Submit</button>
            </div>
        </form>
    </div>

    <!-- Bootstrap JS and dependencies -->
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.3/dist/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
</body>
</html>
<?php
}
?>
