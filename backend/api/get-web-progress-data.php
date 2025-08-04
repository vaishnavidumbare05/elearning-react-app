<?php
header("Access-Control-Allow-Origin: http://localhost:3000");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit;
}

require '../config/db.php';
require_once '../vendor/autoload.php';

try {
    $data = json_decode(file_get_contents('php://input'), true);
   
    error_log("Decoded JSON: " . json_encode($data));

    $userId = $data['userId'] ?? null;
    $requestedCourseId = $data['courseId'] ?? null;

    if (!$userId || !$requestedCourseId) {
        throw new Exception('User ID and Course ID are required');
    }

    $client = new MongoDB\Client("mongodb://localhost:27017");
    $db = $client->learning;

    $user = $db->users->findOne(
        ['_id' => new MongoDB\BSON\ObjectId($userId)],
        ['projection' => [
            'name' => 1,
            'enrolledCourses' => 1,
            'completedAssignments' => 1,
            'assignmentScores' => 1,
            'assignmentTimestamps' => 1,
            'quizAttempts' => 1
        ]]
    );

    if (!$user) {
        throw new Exception('User not found');
    }

    $enrolledCourses = $user['enrolledCourses'] ?? [];
    $enrolledCourse = null;

    foreach ($enrolledCourses as $course) {
        if (isset($course['courseId']) && (string)$course['courseId'] === $requestedCourseId) {
            $enrolledCourse = $course;
            break;
        }
    }

    if (!$enrolledCourse) {
        throw new Exception('User is not enrolled in the requested course');
    }

    $course = $db->courses->findOne(
        ['_id' => new MongoDB\BSON\ObjectId($requestedCourseId)],
        ['projection' => [
            'title' => 1,
            'duration' => 1,
            'modules' => 1,
            'totalAssignments' => 1
        ]]
    );

    if (!$course) {
        throw new Exception('Course not found');
    }

    // Lecture progress
    $completedLectures = [];
    if (isset($enrolledCourse['progress']['completedLectures'])) {
        $completedLectures = iterator_to_array($enrolledCourse['progress']['completedLectures']);
    }
    $completedLectures = array_map(fn($id) => (string)$id, $completedLectures);
    $completedLecturesCount = count($completedLectures);
    $totalVideos = $db->web_videos->countDocuments([]);

    // Duration
    $totalDuration = 0;
   if (isset($course['duration'])) {
    preg_match('/(?:(\d+)\s*min)?\s*(?:(\d+)\s*sec)?/i', $course['duration'], $matches);
    
    $minutes = isset($matches[1]) ? (int)$matches[1] : 0;
    $seconds = isset($matches[2]) ? (int)$matches[2] : 0;

    $totalDuration = ($minutes * 60) + $seconds;
}
 else {
        $videos = $db->videos->find(
            ['courseId' => $course['_id']],
            ['projection' => ['duration' => 1]]
        );
        foreach ($videos as $video) {
            $totalDuration += $video['duration'] ?? 0;
        }
    }

    // Quiz/Assignment stats
    $webCourseQuizes = $db->web_course_quizes;
    $totalAssignments = $webCourseQuizes->countDocuments([]);

   $completedQuizzes = isset($enrolledCourse['progress']['CompletedQuizes']) 
    ? iterator_to_array($enrolledCourse['progress']['CompletedQuizes']) 
    : [];

    $assignmentsCompleted = count($completedQuizzes);
    $totalCorrectAnswers = array_sum(array_column($completedQuizzes, 'totalCorrect'));
    $totalQuestionsAttempted = array_sum(array_column($completedQuizzes, 'totalQuestions'));

    $assignmentCompletion = $totalAssignments > 0
        ? round(($assignmentsCompleted / $totalAssignments) * 100, 1)
        : 0;

    $onTimeSubmissions = 0;
    if (isset($user['assignmentTimestamps'])) {
        foreach ($user['assignmentTimestamps'] as $timestamp) {
            if ($timestamp['submittedOnTime'] ?? false) {
                $onTimeSubmissions++;
            }
        }
    }
    $onTime = $assignmentsCompleted > 0
        ? round(($onTimeSubmissions / $assignmentsCompleted) * 100, 1)
        : 0;

    $totalScore = array_sum(array_column($completedQuizzes, 'score'));
    $totalMaxScore = array_sum(array_column($completedQuizzes, 'totalMarks'));

    $scorePercentage = $totalMaxScore > 0
        ? round(($totalScore / $totalMaxScore) * 100, 1)
        : 0;

    echo json_encode([
        'success' => true,
        'userName' => $user['name'] ?? '',
        'courseTitle' => $course['title'] ?? '',
        'totalDuration' => $totalDuration,
        'lecturesCompleted' => $completedLecturesCount,
        'totalLectures' => $totalVideos,
        'lectureClasses' => [],
        'assignmentData' => [
            'completed' => $assignmentsCompleted,
            'total' => $totalAssignments,
            'completion' => $assignmentCompletion,
            'classes' => [],
        ],
        'onTime' => $onTime,
        'scorePercentage' => $scorePercentage,
        'totalCorrect' => $totalCorrectAnswers,
        'totalQuestion' => $totalQuestionsAttempted,
        'date' => date('Y-m-d'),
    ]);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
