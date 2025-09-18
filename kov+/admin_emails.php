<?php
session_start();
$pass = "kovadmin"; // Mot de passe à personnaliser

if (!isset($_POST['access']) || $_POST['access'] !== $pass) {
  echo '<form method="POST">
          <input type="password" name="access" placeholder="Mot de passe admin" />
          <button type="submit">Accéder</button>
        </form>';
  exit;
}
?>

<?php
$host = "localhost";
$db = "kovplus";
$user = "root";
$pass = "";

$conn = new PDO("mysql:host=$host;dbname=$db", $user, $pass);
$conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$stmt = $conn->query("SELECT * FROM emails ORDER BY sent_at DESC");
$emails = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>

<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>📬 Emails envoyés - Admin KOV+</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 2rem; background: #f9f9f9; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { padding: 10px; border: 1px solid #ccc; text-align: left; }
    th { background-color: #2ecc71; color: white; }
    tr:nth-child(even) { background-color: #f2f2f2; }
    h1 { color: #333; }
  </style>
</head>
<body>
  <h1>📬 Liste des emails envoyés</h1>
  <table>
    <thead>
      <tr>
        <th>ID</th>
        <th>Email</th>
        <th>Message</th>
        <th>Date d'envoi</th>
      </tr>
    </thead>
    <tbody>
      <?php foreach ($emails as $email): ?>
        <tr>
          <td><?= $email['id'] ?></td>
          <td><?= htmlspecialchars($email['email']) ?></td>
          <td><?= nl2br(htmlspecialchars($email['message'])) ?></td>
          <td><?= $email['sent_at'] ?></td>
        </tr>
      <?php endforeach; ?>
    </tbody>
  </table>
</body>
</html>
