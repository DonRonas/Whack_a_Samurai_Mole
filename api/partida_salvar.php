<?php
declare(strict_types=1);

// POST /api/partida_salvar.php  { modo, dificuldade, tamanho, nivel, acertos, pontos, tempo, motivo }
require_once __DIR__ . '/../php/resposta.php';
require_once __DIR__ . '/../php/partidas.php';

exigir_metodo('POST');

$usuario   = exigir_login_api();
$resultado = salvar_partida((int) $usuario['id'], ler_corpo_json());
if (!$resultado['ok']) {
    responder_erro($resultado['erro'], $resultado['status']);
}

responder(['ok' => true, 'id' => $resultado['id']], 201);
