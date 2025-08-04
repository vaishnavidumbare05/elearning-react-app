<?php
// MongoDB connection
require_once __DIR__ . '/../vendor/autoload.php';  // Adjust the path if necessary

$client = new MongoDB\Client("mongodb://localhost:27017"); // Change if necessary
$database = $client->learning; // Replace with your database name
$collection = $database->assessmentsoft; // The collection name

// Insertion and Question Fetching
$insertResult = null;
$questionID = null;

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Capture form data
    $assessment_id = $_POST['assessment_id'];
    $question = $_POST['question'];
    $mcq_options = $_POST['mcq_options']; // Now it's an array
    $answer = $_POST['answer'];

    // Insert data into MongoDB collection
    $insertResult = $collection->insertOne([
        'assessment_id' => $assessment_id,
        'question' => $question,
        'mcq_options' => $mcq_options,
        'answer' => $answer
    ]);

    if ($insertResult->getInsertedCount() > 0) {
        $questionID = $insertResult->getInsertedId(); // Get the ID of the inserted document
        // echo "Assessment added successfully! Assessment ID: " . $assessment_id;
        echo "Assessment added successfully! Assessment ID: " . $assessment_id . " | Question ID: " . $questionID;

    } else {
        echo "Failed to add assessment.";
    }
}

// If a question ID is provided, fetch the specific question from the database
$questionData = null;
if (isset($_GET['question_id'])) {
    $questionID = new MongoDB\BSON\ObjectId($_GET['question_id']);
    $questionData = $collection->findOne(['_id' => $questionID]);
}

// If assessment_id is provided, fetch the questions for that specific assessment_id
if (isset($_GET['assessment_id'])) {
    $assessment_id = $_GET['assessment_id'];
    $questions = $collection->find(['assessment_id' => $assessment_id]);
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Insert Assessment</title>
    <link href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css" rel="stylesheet">
    <style>
        body {
            padding: 20px;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
        h2, h3 {
            text-align: center;
        }
        .form-group {
            margin-bottom: 1.5rem;
        }
        .btn-submit {
            width: 100%;
        }
        .assessment-form {
            background-color: #f9f9f9;
            padding: 20px;
            border-radius: 8px;
        }
        .question-container {
            margin-top: 2rem;
        }
        .mcq-options-container {
            margin-bottom: 1rem;
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Add Software Assessment</h2>
        <div class="assessment-form">
            <form method="POST">
                <div class="form-group">
                    <label for="assessment_id">Assessment ID:</label>
                    <select name="assessment_id" class="form-control" required>
                        <option value="1">1</option>
                        <option value="2">2</option>
                        <option value="3">3</option>
                        <option value="4">4</option>
                        <option value="5">5</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="question">Question:</label>
                    <input type="text" name="question" class="form-control" required>
                </div>

                <div class="form-group">
                    <label>MCQ Options:</label>
                    <div class="mcq-options-container" id="mcqOptionsContainer">
                        <input type="text" name="mcq_options[]" class="form-control mb-2" placeholder="Option 1" required>
                        <input type="text" name="mcq_options[]" class="form-control mb-2" placeholder="Option 2" required>
                        <input type="text" name="mcq_options[]" class="form-control mb-2" placeholder="Option 3" required>
                        <input type="text" name="mcq_options[]" class="form-control mb-2" placeholder="Option 4" required>
                    </div>
                    <button type="button" id="addOptionBtn" class="btn btn-secondary">Add More Option</button>
                </div>

                <div class="form-group">
                    <label for="answer">Answer:</label>
                    <input type="text" name="answer" class="form-control" required>
                </div>

                <button type="submit" class="btn btn-primary btn-submit">Add Assessment</button>
            </form>
        </div>

        <!-- Display question data if available -->
        <?php if ($questionData): ?>
            <div class="question-container">
                <h3>Question ID: <?php echo $questionData['_id']; ?></h3>
                <p><strong>Question: </strong><?php echo $questionData['question']; ?></p>
                <form action="" method="POST">
                    <input type="hidden" name="assessment_id" value="<?php echo $questionData['assessment_id']; ?>">
                    <p><strong>Choose an answer:</strong></p>
                    <?php foreach ($questionData['mcq_options'] as $option): ?>
                        <div class="form-check">
                            <input type="radio" class="form-check-input" name="answer" value="<?php echo $option; ?>" 
                                   <?php echo $option == $questionData['answer'] ? 'checked' : ''; ?>>
                            <label class="form-check-label"><?php echo $option; ?></label>
                        </div>
                    <?php endforeach; ?>
                    <button type="submit" class="btn btn-success btn-submit">Submit Answer</button>
                </form>
            </div>
        <?php endif; ?>

        <!-- Display questions for specific assessment -->
        <?php if (isset($questions)): ?>
            <div class="question-container">
                <h3>Questions for Assessment ID: <?php echo $assessment_id; ?></h3>
                <?php foreach ($questions as $question): ?>
                    <p><strong>Question:</strong> <?php echo $question['question']; ?></p>
                    <form action="" method="POST">
                        <input type="hidden" name="assessment_id" value="<?php echo $question['assessment_id']; ?>">
                        <p><strong>Choose an answer:</strong></p>
                        <?php foreach ($question['mcq_options'] as $option): ?>
                            <div class="form-check">
                                <input type="radio" class="form-check-input" name="answer" value="<?php echo $option; ?>" 
                                       <?php echo $option == $question['answer'] ? 'checked' : ''; ?>>
                                <label class="form-check-label"><?php echo $option; ?></label>
                            </div>
                        <?php endforeach; ?>
                        <button type="submit" class="btn btn-success btn-submit">Submit Answer</button>
                    </form>
                <?php endforeach; ?>
            </div>
        <?php endif; ?>
    </div>

    <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/@popperjs/core@2.5.2/dist/umd/popper.min.js"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/js/bootstrap.min.js"></script>

    <script>
        // Add event listener to dynamically add more MCQ options
        document.getElementById('addOptionBtn').addEventListener('click', function() {
            const container = document.getElementById('mcqOptionsContainer');
            const newOption = document.createElement('input');
            newOption.type = 'text';
            newOption.name = 'mcq_options[]';
            newOption.classList.add('form-control', 'mb-2');
            newOption.placeholder = 'New Option';
            container.appendChild(newOption);
        });
    </script>
</body>
</html>
