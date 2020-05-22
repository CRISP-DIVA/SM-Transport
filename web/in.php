<?php
global $url;

//The Cloud Function's trigger URL
$url = "https://us-central1-ssmm-safe-transportation.cloudfunctions.net/insertUser";
$ch = curl_init();
$payload = { "name" : "Miquel", "email" : "Miquel@gmail.com" };
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt( $ch, CURLOPT_POSTFIELDS, $payload );
curl_setopt( $ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
// Set so curl_exec returns the result instead of outputting it.
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// Get the response and close the channel.
$response = curl_exec($ch);
echo "Printing response: \n\n";
echo $response;
curl_close($ch);
?>

