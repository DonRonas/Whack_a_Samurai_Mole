<?php
declare(strict_types=1);

// POST /api/cadastro.php  { nome, nascimento, cpf, telefone, email, username, senha }
require_once __DIR__ . '/../php/resposta.php';
require_once __DIR__ . '/../php/usuarios.php';

exigir_metodo('POST');

$resultado = criar_usuario(ler_corpo_json());
if (!$resultado['ok']) {
    responder_erro($resultado['erro'], $resultado['status']);
}

responder(['ok' => true], 201);
