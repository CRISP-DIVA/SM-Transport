
<?php
echo "HOLA";
use Google\Cloud\Tasks\V2\AppEngineHttpRequest;
use Google\Cloud\Tasks\V2\CloudTasksClient;
use Google\Cloud\Tasks\V2\HttpMethod;
use Google\Cloud\Tasks\V2\Task;

/** Uncomment and populate these variables in your code */
// $projectId = 'The Google project ID';
// $locationId = 'The Location ID';
// $queueId = 'The Cloud Tasks App Engine Queue ID';
// $payload = 'The payload your task should carry to the task handler. Optional';
$projectId = "ssmm-safe-transportation";
$locationId = "europe-west1";
$queueId = "sm-task-queue";


// Instantiate the client and queue name.
$client = new CloudTasksClient();
$queueName = $client->queueName($projectId, $locationId, $queueId);

// Create an App Engine Http Request Object.
$httpRequest = new AppEngineHttpRequest();
// The path of the HTTP request to the App Engine service.
$httpRequest->setRelativeUri('/task_handler');
// POST is the default HTTP method, but any HTTP method can be used.
$httpRequest->setHttpMethod(HttpMethod::POST);
// Setting a body value is only compatible with HTTP POST and PUT requests.
if (isset($payload)) {
    $httpRequest->setBody($payload);
}

// Create a Cloud Task object.
$task = new Task();
$task->setAppEngineHttpRequest($httpRequest);

// Send request and print the task name.
$response = $client->createTask($queueName, $task);
printf('Created task %s' . PHP_EOL, $response->getName());
include "../index.php";
?>
