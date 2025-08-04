<?php
require_once '../config/db.php';

class Video {
    private $collection;

    public function __construct() {
        $database = new Database();
        $this->collection = $database->getCollection('web_videos'); // Replace 'videos' with your actual collection name
    }

    public function getVideos() {
        $result = $this->collection->find();
        $videos = iterator_to_array($result);
        return $videos;
    }
}
?>
