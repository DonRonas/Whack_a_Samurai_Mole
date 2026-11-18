<?php
declare(strict_types=1);


function config_banco(): array
{
    static $config = null;
    if ($config === null) {
        $config = require __DIR__ . '/config.php';
    }
    return $config;
}


function banco_conectar(bool $comBanco = true): PDO
{
    $c = config_banco();

    if ($c['dsn'] !== '') {
        $dsn = $c['dsn'];
    } else {
        $dsn = 'mysql:host=' . $c['host'] . ';port=' . $c['porta'] . ';charset=utf8mb4';
        if ($comBanco) {
            $dsn .= ';dbname=' . $c['banco'];
        }
    }

    $pdo = new PDO($dsn, $c['usuario'], $c['senha'], [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ]);

    // Datas sempre gravadas e lidas em UTC; o navegador converte para o fuso local.
    if ($pdo->getAttribute(PDO::ATTR_DRIVER_NAME) === 'mysql') {
        $pdo->exec("SET time_zone = '+00:00'");
    }

    return $pdo;
}


function banco(): PDO
{
    static $pdo = null;
    if ($pdo === null) {
        $pdo = banco_conectar(true);
    }
    return $pdo;
}
