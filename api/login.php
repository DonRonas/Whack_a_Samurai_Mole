<?php
declare(strict_types=1);

// POST /api/login.php  { username, senha }
require_once __DIR__ . '/../php/resposta.php';
require_once __DIR__ . '/../php/usuarios.php';

exigir_metodo('POST');

$dados    = ler_corpo_json();
$username = is_string($dados['username'] ?? null) ? $dados['username'] : '';
$senha    = is_string($dados['senha'] ?? null) ? $dados['senha'] : '';

if (trim($username) === '' || $senha === '') {
    responder_erro('Informe o usuário e a senha.', 422);
}

$usuario = verificar_credenciais($username, $senha);
if ($usuario === null) {
    // Mesma mensagem para "usuário não existe" e "senha errada".
    responder_erro('Usuário ou senha incorretos.', 401);
}

registrar_login($usuario['id']);
responder(['ok' => true]);
