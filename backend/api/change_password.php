<?php

header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header('Content-Type: application/json');

require_once '../config/db.php';
require_once __DIR__ . '/../vendor/autoload.php';

use MongoDB\BSON\ObjectId;

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Create MongoDB client
$client = new MongoDB\Client("mongodb://localhost:27017");
$database = $client->learning;
$collection = $database->users;

// Check if the request is POST
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    // Get JSON input
    $data = json_decode(file_get_contents('php://input'), true);

    // Validate required fields
    if (!isset($data['user_id'], $data['old_password'], $data['new_password'])) {
        echo json_encode([
            'success' => false,
            'error' => 'Missing required fields (user_id, old_password, new_password)'
        ]);
        exit;
    }

    try {
        $userId = new ObjectId($data['user_id']);
    } catch (InvalidArgumentException $e) {
        echo json_encode([
            'success' => false,
            'error' => 'Invalid user ID format'
        ]);
        exit;
    }

    // Validate password length
    if (strlen($data['new_password']) < 8) {
        echo json_encode([
            'success' => false,
            'error' => 'New password must be at least 8 characters long'
        ]);
        exit;
    }

    try {
        // Find the user
        $user = $collection->findOne(['_id' => $userId]);

        if (!$user) {
            echo json_encode([
                'success' => false,
                'error' => 'User not found'
            ]);
            exit;
        }

        // Verify old password
        if (!password_verify($data['old_password'], $user['password'])) {
            echo json_encode([
                'success' => false,
                'error' => 'Current password is incorrect'
            ]);
            exit;
        }

        // Check if new password is the same as the old one
        if (password_verify($data['new_password'], $user['password'])) {
            echo json_encode([
                'success' => false,
                'error' => 'New password cannot be the same as the current password'
            ]);
            exit;
        }

        // Hash the new password
        $hashedPassword = password_hash($data['new_password'], PASSWORD_DEFAULT);

        // Update password in database
        $result = $collection->updateOne(
            ['_id' => $userId],
            ['$set' => ['password' => $hashedPassword]]
        );

        if ($result->getMatchedCount() > 0) {
            echo json_encode([
                'success' => true,
                'message' => 'Password changed successfully'
            ]);
        } else {
            echo json_encode([
                'success' => false,
                'error' => 'No changes were made. Please try again.'
            ]);
        }
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'error' => 'Database error: ' . $e->getMessage()
        ]);
    }
} else {
    echo json_encode([
        'success' => false,
        'error' => 'Invalid request method'
    ]);
}
$result = $collection->updateOne(
    ['_id' => $userId],
    ['$set' => ['password' => $hashedPassword]]
);


?>
