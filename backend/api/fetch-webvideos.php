<?php

// CORS Headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");


// Set the Content-Type header for JSON response
header("Content-Type: application/json");
require_once '../config/db.php';
require_once '../models/WebVideo.php';

require_once __DIR__ . '/../models/webVideo.php';

$videoModel = new Video();
$videos = $videoModel->getVideos();

echo json_encode($videos);

?>
