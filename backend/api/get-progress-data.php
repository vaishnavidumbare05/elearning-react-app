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

    // 1. Find user details with enrolled courses
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

    if (!isset($user->enrolledCourses) || count($user->enrolledCourses) === 0) {
        throw new Exception('No enrolled courses found for this user');
    }

    // Get the first enrolled course ID
   // Extract courseId properly from enrolledCourses
$enrolledCourses = $user['enrolledCourses'] ?? [];
$enrolledCourse = null;
$courseId = null;

foreach ($enrolledCourses as $course) {
    if (isset($course['courseId']) && (string)$course['courseId'] === $requestedCourseId) {
        $courseId = $course['courseId'];
        $enrolledCourse = $course;
        break;
    }
}

if (!$courseId) {
    throw new Exception('No valid courseId found in enrolled courses');
}


// Now fetch course details with this courseId
$course = $db->courses->findOne(
    ['_id' => new MongoDB\BSON\ObjectId($courseId)],
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


    // 3. Calculate lecture completion data - Keep existing
    $totalVideos = $db->videos->countDocuments([]);
   
    
// Fetch completed lectures from the enrolled course
$completedLectures = isset($enrolledCourse['progress']['completedLectures']) 
    ? $enrolledCourse['progress']['completedLectures'] 
    : [];

// Ensure the completed lectures are ObjectId strings (if necessary)
$completedLectures = [];
if (isset($enrolledCourse['progress']['completedLectures']) && $enrolledCourse['progress']['completedLectures'] instanceof MongoDB\Model\BSONArray) {
    $completedLectures = iterator_to_array($enrolledCourse['progress']['completedLectures']);
}

$completedLectures = array_map(
    fn($lectureId) => (string)$lectureId,
    $completedLectures
);


// Check the count of completed lectures
$completedLecturesCount = count($completedLectures); // This should now count the number of completed lectures correctly

// Output for debugging
error_log("Completed Lectures: " . json_encode($completedLectures));
error_log("Completed Lectures Count: " . $completedLecturesCount);
    // Module breakdown not available without moduleId - returning empty
    $lectureClasses = []; 

    // 4. Calculate total duration - Keep existing
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

    // 5. Calculate assignment progress metrics - MODIFIED SECTION
$pythonCourseQuizes = $db->python_course_quizes;
$totalAssignments = $pythonCourseQuizes->countDocuments([]);

// Fetch the enrolled course's progress that matches current course ID
$completedQuizzes = [];
$totalCorrectAnswers = 0;
$totalQuestionsAttempted = 0;
$assignmentsCompleted = 0;

// Step 1: Loop over the enrolled courses
$completedQuizzes = [];
$assignmentsCompleted = 0;
$totalCorrectAnswers = 0;
$totalQuestionsAttempted = 0;

if (isset($user['enrolledCourses'])) {
    foreach ($user['enrolledCourses'] as $enrolledCourse) {
        // Log the raw data for each enrolled course
        error_log("Enrolled course raw data: " . json_encode($enrolledCourse));

        // Ensure courseId exists
        if (isset($enrolledCourse['courseId'])) {
            error_log("Found courseId: " . $enrolledCourse['courseId']);
        } else {
            error_log("courseId NOT FOUND in this enrolledCourse.");
        }

        // Ensure we're comparing ObjectId as string
        if ((string)$enrolledCourse['courseId'] === (string)$course['_id']) {
            // Log when a match is found
            error_log("Matched courseId: " . $enrolledCourse['courseId'] . " with course _id: " . $course['_id']);

            // Step 2: Fetch completed quizzes from the enrolled course
            $completedQuizzes = $enrolledCourse['progress']['CompletedQuizes'] ?? [];
            
            // Calculate total correct answers and questions attempted
            foreach ($completedQuizzes as $quiz) {
                $totalCorrectAnswers += $quiz['totalCorrect'] ?? 0;
                $totalQuestionsAttempted += $quiz['totalQuestions'] ?? 0;
            }

            // Calculate assignments completed
            $assignmentsCompleted = count($completedQuizzes);

            // Log assignment data
            error_log("Assignments completed: " . $assignmentsCompleted);

            break;  // Exit loop once we have the relevant course
        }
    }
} else {
    error_log("No enrolled courses found for this user.");
}

// Step 3: Calculate assignment completion percentage
$assignmentCompletion = $totalAssignments > 0
    ? round(($assignmentsCompleted / $totalAssignments) * 100, 1)
    : 0;


// On-time submission calculation remains unchanged
$onTimeSubmissions = 0;
if (isset($user['assignmentTimestamps'])) {
    foreach ($user['assignmentTimestamps'] as $timestamp) {
        if ($timestamp['submittedOnTime'] ?? false) {
            $onTimeSubmissions++;
        }
    }
    $onTime = $assignmentsCompleted > 0
        ? round(($onTimeSubmissions / $assignmentsCompleted) * 100, 1)
        : 0;
} else {
    $onTime = 0;
}

    // Calculate average score - Keep existing
  $totalScore = 0;
$totalMaxScore = 0;

if (!empty($completedQuizzes)) {
    foreach ($completedQuizzes as $quiz) {
        $totalScore += $quiz['score'] ?? 0;
        $totalMaxScore += $quiz['totalMarks'] ?? 0;
    }
}



$scorePercentage = $totalMaxScore > 0
    ? round(($totalScore / $totalMaxScore) * 100, 1)
    : 0;
   $assignmentClasses = []; 

    // Prepare response
   $response = [
    'success' => true,
    'userName' => $user['name'] ?? '',
    'courseTitle' => $course['title'] ?? '',
    'totalDuration' => $totalDuration,
    'lecturesCompleted' =>$completedLecturesCount,
    'totalLectures' => $totalVideos,
    'lectureClasses' => $lectureClasses,
    'assignmentData' => [
    'completed' => $assignmentsCompleted,
    'total' => $totalAssignments,
    'completion' => $assignmentCompletion,
    'classes' => $assignmentClasses,
],
    'onTime' => $onTime,
    'totalAssignments' => $totalAssignments,
    'scorePercentage' => $scorePercentage,
    'totalCorrect' => $totalCorrectAnswers,
    'totalQuestion' => $totalQuestionsAttempted,
    'date' => date('Y-m-d'),
];

    
    if ($totalDuration === 0) {
        $response['warning'] = 'Total duration is 0. Please check video durations.';
    }
    
    echo json_encode($response);

} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}