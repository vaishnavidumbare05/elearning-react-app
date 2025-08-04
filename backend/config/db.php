<?php
// require_once __DIR__ . '/../vendor/autoload.php'; // Make sure this path is correct and 'vendor' exists in the specified directory.

// use MongoDB\Client;

// class Database {
//     private $client;
//     private $db;

//     public function __construct() {
//         // Initialize the MongoDB client connection
//         $this->client = new Client("mongodb://localhost:27017");
        
//         // Connect to the specified database, here 'learning'
//         $this->db = $this->client->learning; // Ensure 'learning' matches your MongoDB database name
//     }

//     /**
//      * Get a MongoDB collection
//      * 
//      * @param string $collectionName The name of the collection to retrieve
//      * @return MongoDB\Collection The requested collection
//      */
//     public function getCollection($collectionName) {
//         return $this->db->$collectionName;
//     }
// }


require_once __DIR__ . '/../vendor/autoload.php';

use MongoDB\Client;
use Dotenv\Dotenv;

class Database {
    private $client;
    private $db;

    public function __construct() {
        $dotenv = Dotenv::createImmutable(__DIR__ . '/..');
        $dotenv->load();

        $uri = $_ENV['MONGO_URI'] ?? 'mongodb://localhost:27017';
        $dbName = $_ENV['DB_NAME'] ?? 'learning';

        $this->client = new Client($uri);
        $this->db = $this->client->$dbName;
    }

    public function getDb() {
        return $this->db;
    }

    public function getCollection($collectionName) {
        return $this->db->$collectionName;
    }
}

