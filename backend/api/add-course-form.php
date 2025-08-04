<?php
require_once "../config/db.php"; // Include the database connection file

// Initialize Database connection
$database = new Database();
$db = $database->getDb(); // Get the database instance

// Ensure $db is set before using it
if (!$db) {
    die(json_encode(["success" => false, "message" => "Database connection failed!"]));
}

// Fetch courses from MongoDB
$collection = $db->courses; // Get the 'courses' collection
$courses = $collection->find([], ['projection' => ['course_id' => 1, 'title' => 1]]);
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Add Course Details</title>
    
    <!-- Bootstrap 4 or 5 CSS -->
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">

</head>
<body>
    <div class="container mt-5">
        <h2 class="mb-4">Add Course Details</h2>
        <form action="process-add-course.php" method="POST" enctype="multipart/form-data">
    <div class="form-group">
        <label for="title">Select Course:</label>
        <select name="title" id="title" class="form-control" required>
            <option value="">-- Select a Course --</option>
            <?php
            foreach ($courses as $course) {
                echo "<option value='{$course['title']}'>{$course['title']}</option>";
            }
            ?>
        </select>
    </div>

    <div class="form-group">
        <label for="duration">Duration:</label>
        <input type="text" name="duration" id="duration" class="form-control" required>
    </div>

    <div class="form-group">
        <label for="status">Status:</label>
        <select name="status" id="status" class="form-control" required>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
        </select>
    </div>

    <div class="form-group">
        <label for="videoUpload">Upload Video:</label>
        <input type="file" name="videoUpload" id="videoUpload" class="form-control-file" accept="video/*" required>
    </div>

    <button type="submit" class="btn btn-primary">Add Course Details</button>
</form>

    </div>

    <!-- Bootstrap JS (for components like modal, etc.) -->
    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.9.3/dist/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>
</body>
</html>
