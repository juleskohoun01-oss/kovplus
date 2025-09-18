<?php
$host = "localhost";
$db = "kovplus";
$user = "root";
$pass = "";

$conn = new PDO("mysql:host=$host;dbname=$db", $user, $pass);

$email = $_POST['email'];
$message = $_POST['message'];

$sql = "INSERT INTO emails (email, message, sent_at) VALUES (?, ?, NOW())";
$stmt = $conn->prepare($sql);
$stmt->execute([$email, $message]);

echo "OK";
?>
