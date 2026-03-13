<?php
session_start();

$dbDir = __DIR__ . '/data';
$dbFile = $dbDir . '/farm.sqlite';
if (!is_dir($dbDir)) {
    mkdir($dbDir, 0775, true);
}

$pdo = new PDO('sqlite:' . $dbFile, null, null, [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
]);
$pdo->exec('CREATE TABLE IF NOT EXISTS saves (
    player_id TEXT PRIMARY KEY,
    money INTEGER NOT NULL,
    eggs INTEGER NOT NULL,
    crates INTEGER NOT NULL,
    stack INTEGER NOT NULL,
    chickens INTEGER NOT NULL,
    level INTEGER NOT NULL,
    updated_at TEXT NOT NULL
)');

if (!isset($_SESSION['player_id'])) {
    $_SESSION['player_id'] = bin2hex(random_bytes(8));
}
$playerId = $_SESSION['player_id'];

$defaultState = [
    'money' => 120,
    'eggs' => 0,
    'crates' => 0,
    'stack' => 0,
    'chickens' => 6,
    'level' => 1,
];

if (isset($_GET['api'])) {
    header('Content-Type: application/json; charset=utf-8');
    $api = $_GET['api'];

    if ($api === 'load') {
        $stmt = $pdo->prepare('SELECT money, eggs, crates, stack, chickens, level FROM saves WHERE player_id = :id');
        $stmt->execute([':id' => $playerId]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        echo json_encode(['ok' => true, 'state' => $row ?: $defaultState]);
        exit;
    }

    if ($api === 'save') {
        $input = json_decode(file_get_contents('php://input'), true);
        if (!is_array($input)) {
            http_response_code(400);
            echo json_encode(['ok' => false, 'error' => 'invalid_payload']);
            exit;
        }

        $state = [
            'money' => max(0, (int)($input['money'] ?? 0)),
            'eggs' => max(0, (int)($input['eggs'] ?? 0)),
            'crates' => max(0, (int)($input['crates'] ?? 0)),
            'stack' => max(0, (int)($input['stack'] ?? 0)),
            'chickens' => max(1, (int)($input['chickens'] ?? 1)),
            'level' => max(1, (int)($input['level'] ?? 1)),
        ];

        $stmt = $pdo->prepare('INSERT INTO saves (player_id, money, eggs, crates, stack, chickens, level, updated_at)
            VALUES (:id, :money, :eggs, :crates, :stack, :chickens, :level, :updated_at)
            ON CONFLICT(player_id) DO UPDATE SET
                money = excluded.money,
                eggs = excluded.eggs,
                crates = excluded.crates,
                stack = excluded.stack,
                chickens = excluded.chickens,
                level = excluded.level,
                updated_at = excluded.updated_at');
        $stmt->execute([
            ':id' => $playerId,
            ':money' => $state['money'],
            ':eggs' => $state['eggs'],
            ':crates' => $state['crates'],
            ':stack' => $state['stack'],
            ':chickens' => $state['chickens'],
            ':level' => $state['level'],
            ':updated_at' => date(DATE_ATOM),
        ]);

        echo json_encode(['ok' => true]);
        exit;
    }

    if ($api === 'reset') {
        $stmt = $pdo->prepare('DELETE FROM saves WHERE player_id = :id');
        $stmt->execute([':id' => $playerId]);
        echo json_encode(['ok' => true]);
        exit;
    }

    http_response_code(404);
    echo json_encode(['ok' => false, 'error' => 'unknown_api']);
    exit;
}
?>
<!DOCTYPE html>
<html lang="de">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Farm Stack Tycoon PHP</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main class="shell">
      <header>
        <h1>🐔 Farm Stack Tycoon</h1>
        <div class="stats">
          <span>💰 <strong id="money">0</strong>$</span>
          <span>🥚 <strong id="eggs">0</strong></span>
          <span>📦 <strong id="crates">0</strong></span>
          <span>🏗️ Stapel <strong id="stack">0</strong>/12</span>
          <span>🐓 Hühner <strong id="chickens">0</strong></span>
        </div>
      </header>

      <canvas id="gameCanvas" width="1100" height="700"></canvas>

      <section class="controls">
        <button id="buyChicken">Huhn kaufen (200$)</button>
        <button id="upgradeFarm">Farm Upgrade (450$)</button>
        <button id="resetSave" class="danger">Neu starten</button>
        <p>
          Klick auf den Boden zum Laufen. Eier aufsammeln, zur Maschine bringen und Kisten am
          Verkaufstisch verkaufen.
        </p>
      </section>

      <ul id="log"></ul>
    </main>

    <script src="game.js"></script>
  </body>
</html>
