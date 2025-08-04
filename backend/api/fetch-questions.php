<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json");

require_once '../config/db.php';
require_once __DIR__ . '/../vendor/autoload.php';

use MongoDB\Client;
use MongoDB\Exception\Exception;

try {
    $client = new Client("mongodb://localhost:27017"); // Connect to MongoDB
    $collection = $client->learning->quiz_questions; // Select the collection

    $cursor = $collection->find();
    $questions = [];

    foreach ($cursor as $document) {
            $questions[] = [
                'id' => (string) $document['_id'], // ✅ Add ID here
                'question' => $document['question'],
                'options' => $document['options'],
                'answer' => $document['correctAnswer'],
                'marks' => isset($document['marks']) ? (int) $document['marks'] : 0
            
        ];
    }

    echo json_encode(['questions' => $questions]);
} catch (Exception $e) {
    echo json_encode(['error' => "Failed to fetch questions: " . $e->getMessage()]);
}
?>
