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


require_once __DIR__ . '/../vendor/autoload.php'; // Ensure this path is correct and 'vendor' exists in the specified directory.

use MongoDB\Client;

class Database {
    private $client;
    private $db;

    public function __construct() {
        // Initialize the MongoDB client connection
        $this->client = new Client("mongodb://localhost:27017");
        
        // Connect to the specified database, here 'learning'
        $this->db = $this->client->learning; // Ensure 'learning' matches your MongoDB database name
    }

    /**
     * Get the MongoDB database instance
     * 
     * @return MongoDB\Database The database instance
     */
    public function getDb() {
        return $this->db; // Return the database instance
    }

    /**
     * Get a MongoDB collection
     * 
     * @param string $collectionName The name of the collection to retrieve
     * @return MongoDB\Collection The requested collection
     */
    public function getCollection($collectionName) {
        return $this->db->$collectionName;
    }
}
