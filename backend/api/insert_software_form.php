<?php
// Include the database class
require_once __DIR__ . '/../config/db.php'; // Adjust the path as needed

// Handle form submission when the form is posted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Get the video details from the form
    $title = $_POST['title'];
    $duration = $_POST['duration'];
    $status = $_POST['status'];

    // Handle file upload
    $videoFile = $_FILES['video'];
    $uploadDir = 'uploads/';
    $videoFileName = time() . '_' . basename($videoFile['name']);
    $uploadFilePath = $uploadDir . $videoFileName;

    // Validate file upload
    if (move_uploaded_file($videoFile['tmp_name'], $uploadFilePath)) {
        // Video uploaded successfully, now insert into MongoDB
        try {
            // Initialize the database connection
            $dbInstance = new Database();
            $db = $dbInstance->getDb();
            $collection = $dbInstance->getCollection("software_developer_videos"); // Your collection name

            // Prepare data for insertion
            $videoData = [
                'title' => $title,
                'duration' => $duration,
                'status' => $status,
                'path' => $uploadFilePath // Store the path of the uploaded video
            ];

            // Insert data into MongoDB
            $collection->insertOne($videoData);

            // Success message
            $successMessage = "Video information inserted successfully!";
        } catch (Exception $e) {
            $errorMessage = "Error: " . $e->getMessage();
        }
    } else {
        $errorMessage = "Failed to upload the video.";
    }
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Insert Video Information</title>
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css">
</head>
<body>

<div class="container mt-5">
    <h2>Add Software Video Information</h2>

    <!-- Display success or error message -->
    <?php if (isset($successMessage)): ?>
        <div class="alert alert-success"><?php echo $successMessage; ?></div>
    <?php elseif (isset($errorMessage)): ?>
        <div class="alert alert-danger"><?php echo $errorMessage; ?></div>
    <?php endif; ?>

    <!-- Video Information Form -->
    <form action="insert_video_form.php" method="POST" enctype="multipart/form-data">
        <div class="form-group">
            <label for="title">Video Title:</label>
            <input type="text" id="title" name="title" class="form-control" required>
        </div>

        <div class="form-group">
            <label for="duration">Duration (e.g., 15:30):</label>
            <input type="text" id="duration" name="duration" class="form-control" required>
        </div>

        <div class="form-group">
            <label for="status">Status (active/inactive):</label>
            <select id="status" name="status" class="form-control" required>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
            </select>
        </div>

        <div class="form-group">
            <label for="video">Upload Video:</label>
            <input type="file" id="video" name="video" class="form-control" accept="video/*" required>
        </div>

        <button type="submit" class="btn btn-primary">Submit</button>
    </form>
</div>

</body>
</html>
