<?php
require_once '../config/db.php'; // Include MongoDB config if needed
require_once __DIR__ . '/../vendor/autoload.php'; // Ensure autoload is set up correctly

// Initialize MongoDB client
try {
    $client = new MongoDB\Client("mongodb://localhost:27017"); // Adjust connection string if necessary
    $db = $client->learning; // Replace with actual database name
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Failed to connect to MongoDB: " . $e->getMessage()]);
    exit;
}

// Handle Insert (New Course) and Edit (Existing Course)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $courseId = $_POST['courseId'] ?? '';
    $title = $_POST['title'] ?? ''; // Use 'title' here instead of 'name'
    $description = $_POST['description'] ?? '';
    $duration = $_POST['duration'] ?? '';
    $image = $_FILES['image'] ?? null;

    if (empty($title) || empty($description) || empty($duration)) {
        echo json_encode(["success" => false, "message" => "Missing course data"]);
        exit;
    }

    // Handle image upload for insert or edit
    if ($image) {
        $imageDir = 'uploads/';
        if (!file_exists($imageDir)) {
            mkdir($imageDir, 0777, true);
        }
        $imagePath = $imageDir . basename($image['name']);
        if (!move_uploaded_file($image['tmp_name'], $imagePath)) {
            echo json_encode(["success" => false, "message" => "Failed to upload image"]);
            exit;
        }
    }

    // Prepare the course data
    $courseData = [
        'title' => $title,  // Save 'title' here
        'description' => $description,
        'duration' => $duration,
    ];

    if ($image) {
        $courseData['image'] = $imagePath; // Save the image path
    }

    // Insert or update course based on whether courseId is present
    $coursesCollection = $db->courses;
    if ($courseId) {
        // Editing existing course
        $result = $coursesCollection->updateOne(
            ['_id' => new MongoDB\BSON\ObjectId($courseId)],
            ['$set' => $courseData]
        );

        if ($result->getModifiedCount() == 1) {
            echo json_encode(["success" => true, "message" => "Course updated successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to update course"]);
        }
    } else {
        // Inserting new course
        $result = $coursesCollection->insertOne($courseData);
        if ($result->getInsertedCount() == 1) {
            echo json_encode(["success" => true, "message" => "Course added successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Failed to add course"]);
        }
    }
    exit;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Course Management</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/css/bootstrap.min.css" rel="stylesheet">
</head>
<body>
    <div class="container mt-5">
        <h2 class="text-center mb-4">Course Management</h2>

        <!-- Insert Course Form -->
        <h3>Add New Course</h3>
        <form action="" method="POST" enctype="multipart/form-data">
            <div class="mb-3">
                <label for="title" class="form-label">Course Title</label>
                <input type="text" class="form-control" id="title" name="title" required>
            </div>
            <div class="mb-3">
                <label for="description" class="form-label">Description</label>
                <textarea class="form-control" id="description" name="description" rows="4" required></textarea>
            </div>
            <div class="mb-3">
                <label for="duration" class="form-label">Duration</label>
                <input type="text" class="form-control" id="duration" name="duration" required>
            </div>
            <div class="mb-3">
                <label for="image" class="form-label">Course Image</label>
                <input type="file" class="form-control" id="image" name="image" accept="image/*">
            </div>
            <button type="submit" class="btn btn-primary">Add Course</button>
        </form>

        <hr>

        <!-- Display Courses List -->
        <h3>Courses List</h3>
        <div class="row">
            <?php
            // Fetch the courses
            $coursesCollection = $db->courses;
            $courses = $coursesCollection->find()->toArray();

            foreach ($courses as $course) : ?>
                <div class="col-md-4 mb-4">
                    <div class="card shadow-lg rounded">
                        <img src="<?= $course['image'] ?>" class="card-img-top" alt="<?= $course['title'] ?>" />
                        <div class="card-body">
                            <h5 class="card-title"><?= $course['title'] ?></h5>
                            <p class="card-text"><?= $course['description'] ?></p>
                            <p><strong>Duration:</strong> <?= $course['duration'] ?></p>
                            <!-- Edit Button -->
                            <button class="btn btn-warning" data-bs-toggle="modal" data-bs-target="#editCourseModal<?= (string) $course['_id'] ?>">Edit</button>
                            <!-- Delete Button -->
                            <form action="" method="POST" style="display:inline;">
                                <input type="hidden" name="deleteCourseId" value="<?= (string) $course['_id'] ?>">
                                <button type="submit" class="btn btn-danger" 
    <?php 
        // Check if 'createdAt' exists for the current course and the second course
        if (isset($course['createdAt']) && isset($courses[1]['createdAt']) && $course['createdAt'] < $courses[1]['createdAt']) {
            echo 'disabled';
        }
    ?>>
    Delete
</button>

                            </form>
                        </div>
                    </div>
                </div>

                <!-- Edit Course Modal -->
                <div class="modal fade" id="editCourseModal<?= (string) $course['_id'] ?>" tabindex="-1" aria-labelledby="editCourseModalLabel" aria-hidden="true">
                    <div class="modal-dialog">
                        <div class="modal-content">
                            <div class="modal-header">
                                <h5 class="modal-title" id="editCourseModalLabel">Edit Course</h5>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <form action="" method="POST" enctype="multipart/form-data">
                                    <input type="hidden" name="courseId" value="<?= (string) $course['_id'] ?>">
                                    <div class="mb-3">
                                        <label for="title" class="form-label">Course Title</label>
                                        <input type="text" class="form-control" id="title" name="title" value="<?= $course['title'] ?>" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="description" class="form-label">Description</label>
                                        <textarea class="form-control" id="description" name="description" rows="4" required><?= $course['description'] ?></textarea>
                                    </div>
                                    <div class="mb-3">
                                        <label for="duration" class="form-label">Duration</label>
                                        <input type="text" class="form-control" id="duration" name="duration" value="<?= $course['duration'] ?>" required>
                                    </div>
                                    <div class="mb-3">
                                        <label for="image" class="form-label">Course Image</label>
                                        <input type="file" class="form-control" id="image" name="image" accept="image/*">
                                    </div>
                                    <button type="submit" class="btn btn-primary">Update Course</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>

            <?php endforeach; ?>
        </div>

    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0-alpha1/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>
