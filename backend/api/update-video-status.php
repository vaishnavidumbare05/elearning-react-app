<?php
// update-video-status.php
require_once '../config/db.php'; // MongoDB connection

// Get data from the POST request
$videoId = $_POST['videoId'];
$status = $_POST['status'];

try {
    // MongoDB connection
    $database = new Database();
    $collection = $database->getCollection('videos');

    // Convert videoId to MongoDB ObjectId
    $videoId = new MongoDB\BSON\ObjectId($videoId);

    // Update video status
    $updateResult = $collection->updateOne(
        ['_id' => $videoId],
        ['$set' => ['status' => $status]]
    );

    if ($updateResult->getModifiedCount() > 0) {
        echo json_encode(['success' => true, 'message' => 'Video status updated successfully']);
    } else {
        echo json_encode(['success' => false, 'message' => 'No video found or status unchanged']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
