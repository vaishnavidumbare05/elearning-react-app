<?php
// Set headers for CORS (Cross-Origin Resource Sharing)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Get the code from the POST request (preferably JSON format)
$data = json_decode(file_get_contents("php://input"), true);  
$code = $data['code'] ?? '';  

// If no code is provided, return an error
if (empty($code)) {
    echo json_encode(['output' => 'No code provided']);
    exit;
}

// Log the received code for debugging
error_log("Received code: " . $code);

// Create a temporary file to save the code
$tempFile = tempnam(sys_get_temp_dir(), 'code_') . '.py';  // Ensure it has .py extension
file_put_contents($tempFile, $code);  

// Ensure that the temporary file is executable (permissions)
chmod($tempFile, 0755);

// Path to Python executable
$pythonPath = "C:\\Users\\Vaish\\AppData\\Local\\Programs\\Python\\Python310\\python";

// Construct the command to execute Python script
$command = escapeshellcmd("$pythonPath $tempFile 2>&1");  // Capture errors too
error_log("Running command: " . $command);

// Execute the Python code
$output = shell_exec($command);
error_log("Python output: " . $output);

// Check if there was an error during execution
if ($output === null || empty($output)) {
    echo json_encode(['output' => 'Error executing code', 'error' => error_get_last()]);
    unlink($tempFile);  // Clean up temporary file
    exit;
}

// Clean up the temporary file
unlink($tempFile);

// Return the output as JSON
echo json_encode(['output' => htmlspecialchars($output)]);

?>
