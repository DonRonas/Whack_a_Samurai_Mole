<?php
declare(strict_types=1);

// GET /api/historico.php  -> partidas do usuário logado, da mais recente para a mais antiga
require_once __DIR__ . '/../php/resposta.php';
require_once __DIR__ . '/../php/partidas.php';

exigir_metodo('GET');

$usuario = exigir_login_api();

responder(['ok' => true, 'partidas' => historico_do_usuario((int) $usuario['id'])]);
