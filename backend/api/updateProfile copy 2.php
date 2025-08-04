<?php
// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header("Access-Control-Allow-Origin: http://localhost:3000");
    header("Access-Control-Allow-Methods: POST, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Credentials: true");
    http_response_code(200);
    exit();
}

// Common headers
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header('Content-Type: application/json');


require_once '../config/db.php';
require_once __DIR__ . '/../vendor/autoload.php';

use MongoDB\Client;
use MongoDB\BSON\ObjectId;

$client = new Client("mongodb://localhost:27017");
$collection = $client->learning->users;

// Function to print profile_pic_url
function printProfilePicUrl($response) {
    if (isset($response['success']) && $response['success'] && isset($response['user']['profile_pic_url'])) {
        echo $response['user']['profile_pic_url'];
    } else {
        echo "Profile picture URL not available";
    }
}

if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $response = ['success' => false];
    
    try {
        // Verify required fields
        if (empty($_POST['user_id'])) {
            throw new Exception('User ID is required');
        }

        $userId = new ObjectId($_POST['user_id']);
        $updateData = [];

        // Handle name update
        if (!empty($_POST['name'])) {
            $updateData['name'] = $_POST['name'];
        }

        // Handle file upload
        if (isset($_FILES['profile_pic']) && $_FILES['profile_pic']['error'] === UPLOAD_ERR_OK) {
            $uploadDir = __DIR__ . '/../uploads/profile_pics/';
            
            // Create directory if it doesn't exist
            if (!file_exists($uploadDir)) {
                if (!mkdir($uploadDir, 0755, true)) {
                    throw new Exception('Failed to create upload directory');
                }
            }

            // Validate file type
            $allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
            $fileName = $_FILES['profile_pic']['name'];
            $fileExt = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
            
            if (!in_array($fileExt, $allowedExtensions)) {
                throw new Exception('Invalid file type. Only JPG, PNG, GIF, and WEBP allowed.');
            }

            // Get current profile pic to delete later
            $currentUser = $collection->findOne(['_id' => $userId]);
            $currentPic = $currentUser['profile_pic'] ?? null;

            // Generate unique filename
            $newFilename = uniqid() . '.' . $fileExt;
            $destination = $uploadDir . $newFilename;

            // Move uploaded file
            if (move_uploaded_file($_FILES['profile_pic']['tmp_name'], $destination)) {
                $updateData['profile_pic'] = $newFilename;
                
                // Delete old profile picture if it exists
                if ($currentPic && file_exists($uploadDir . $currentPic)) {
                    unlink($uploadDir . $currentPic);
                }
            } else {
                throw new Exception('Failed to save uploaded file');
            }
        }

        // Update database if there are changes
        if (!empty($updateData)) {
            $result = $collection->updateOne(
                ['_id' => $userId],
                ['$set' => $updateData]
            );

            if ($result->getModifiedCount() > 0) {
                // Get updated user data
                $updatedUser = $collection->findOne(['_id' => $userId]);
                
                $response = [
                    'success' => true,
                    'message' => 'Profile updated successfully',
                    'user' => [
                        'name' => $updatedUser['name'] ?? null,
                        'profile_pic' => $updatedUser['profile_pic'] ?? null,
                        'profile_pic_url' => isset($updatedUser['profile_pic']) ? 
                            'http://localhost/backend/uploads/profile_pics/'.$updatedUser['profile_pic'] : null
                    ]
                ];

                // Print profile_pic_url before sending JSON response
                echo json_encode($response);

                error_log("Image saved to: " . $destination);
error_log("Accessible via: http://localhost/backend/uploads/profile_pics/" . $newFilename);

            } else {
                $response['message'] = 'No changes were made';
            }
        } else {
            $response['message'] = 'No data provided for update';
        }
    } catch (Exception $e) {
        $response['error'] = $e->getMessage();
    }

   echo json_encode([
    "success" => true,
    "message" => "Profile updated successfully!"
]);

    exit;
}
?>