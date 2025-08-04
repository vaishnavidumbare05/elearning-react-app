<?php
require_once __DIR__ . '/../vendor/autoload.php';

$client = new MongoDB\Client("mongodb://localhost:27017");
$collection = $client->learning->assessment_soft_results;

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $assessmentId = $_GET['assessment_id'] ?? null;
    $userId = $_GET['user_id'] ?? null; // Optional, if tracking by user

    if ($assessmentId) {
        $filter = ['assessment_id' => (int)$assessmentId];
        if ($userId) {
            $filter['user_id'] = $userId;
        }

        try {
            $document = $collection->findOne($filter);

            if ($document) {
                echo json_encode([
                    'success' => true,
                    'data' => [
                        'assessment_id' => $document['assessment_id'],
                        'status' => $document['status']
                    ]
                ]);
            } else {
                echo json_encode(['success' => false, 'message' => 'Assessment not found.']);
            }
        } catch (Exception $e) {
            echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Invalid assessment ID.']);
    }
}
?>