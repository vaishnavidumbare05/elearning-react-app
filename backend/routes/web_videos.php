<?php
// backend/routes/videos.php
// CORS Headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");


header("Content-Type: application/json");
require_once '../config/db.php'; // Ensure this path is correct

try {
    // Instantiate the Database class and get the 'videos' collection
    $database = new Database();
    $collection = $database->getCollection("web_videos");

    // Retrieve only the necessary fields from the 'videos' collection
    $videos = $collection->find([], ['projection' => ['title' => 1, 'status' => 1, 'duration' => 1, 'video_url' => 1]]);

    // Convert documents to an array and send as JSON response
    $videoArray = iterator_to_array($videos);
    echo json_encode($videoArray);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
