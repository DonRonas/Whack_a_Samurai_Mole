<?php
declare(strict_types=1);

// POST /api/usuario_atualizar.php  { nome, telefone, email, senha }  (senha em branco = mantém a atual)
require_once __DIR__ . '/../php/resposta.php';
require_once __DIR__ . '/../php/usuarios.php';

exigir_metodo('POST');

$usuario   = exigir_login_api();
$resultado = atualizar_usuario((int) $usuario['id'], ler_corpo_json());
if (!$resultado['ok']) {
    responder_erro($resultado['erro'], $resultado['status']);
}

responder(['ok' => true]);
