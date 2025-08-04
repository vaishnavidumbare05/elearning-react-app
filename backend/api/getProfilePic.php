<?php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

require_once '../config/db.php';
require_once __DIR__ . '/../vendor/autoload.php';

use MongoDB\Client;

$client = new MongoDB\Client("mongodb://localhost:27017");
$database = $client->learning;
$collection = $database->users;

$user_id = $_GET['user_id'] ?? '';

if (!$user_id) {
    echo json_encode(['success' => false, 'error' => 'User ID is missing']);
    exit;
}

try {
    $document = $collection->findOne(['_id' => new MongoDB\BSON\ObjectID($user_id)]);

    if ($document) {
        $profilePic = $document['profile_pic'] ?? null;
        $profilePicUrl = $profilePic 
            ? "http://localhost/backend/uploads/profile_pics/" . $profilePic 
            : "http://localhost/backend/uploads/profile_pics/avatar.png";

        echo json_encode([
            'success' => true,
            'user' => [
                'name' => $document['name'] ?? '',
                'email' => $document['email'] ?? '',
                'profile_pic' => $profilePic,
                'profile_pic_url' => $profilePicUrl
            ]
        ]);
    } else {
        echo json_encode(['success' => false, 'error' => 'User not found']);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
}
?>
