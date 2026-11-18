<?php
declare(strict_types=1);

// GET /api/usuario.php  -> dados do usuário logado (sem a senha)
require_once __DIR__ . '/../php/resposta.php';

exigir_metodo('GET');

$usuario = exigir_login_api();
unset($usuario['id']); // o navegador não precisa do id interno

responder(['ok' => true, 'usuario' => $usuario]);
