<?php
declare(strict_types=1);

/**
 * Regras de negócio dos usuários: cadastro, conferência de credenciais e alteração.
 * As funções de escrita devolvem ['ok' => true, ...] ou ['ok' => false, 'erro' => texto, 'status' => HTTP].
 */

require_once __DIR__ . '/banco.php';
require_once __DIR__ . '/validacao.php';


const HASH_FALSO = '$2y$10$EYNt4ZovL5L029wmHGDXMO.VPNKx42Go5kiC4T15muJ8B0yjuMqXy';

function falha(string $erro, int $status): array
{
    return ['ok' => false, 'erro' => $erro, 'status' => $status];
}

function criar_usuario(array $dados): array
{
    $nome       = campo_texto($dados, 'nome');
    $nascimento = campo_texto($dados, 'nascimento');
    $cpf        = campo_texto($dados, 'cpf');
    $telefone   = campo_texto($dados, 'telefone');
    $email      = campo_texto($dados, 'email');
    $username   = campo_texto($dados, 'username');
    $senha      = campo_senha($dados);

    $erro = validar_nome($nome)
        ?? validar_nascimento($nascimento)
        ?? validar_cpf($cpf)
        ?? validar_telefone($telefone)
        ?? validar_email($email)
        ?? validar_username($username)
        ?? validar_senha($senha);
    if ($erro !== null) {
        return falha($erro, 422);
    }

    $cpf = so_digitos($cpf);
    $pdo = banco();

    
    $st = $pdo->prepare('SELECT 1 FROM usuarios WHERE LOWER(username) = LOWER(?)');
    $st->execute([$username]);
    if ($st->fetchColumn()) {
        return falha('Esse username já está em uso.', 409);
    }

    $st = $pdo->prepare('SELECT 1 FROM usuarios WHERE cpf = ?');
    $st->execute([$cpf]);
    if ($st->fetchColumn()) {
        return falha('Já existe um cadastro com esse CPF.', 409);
    }

    try {
        $st = $pdo->prepare(
            'INSERT INTO usuarios (nome, nascimento, cpf, telefone, email, username, senha_hash)
             VALUES (?, ?, ?, ?, ?, ?, ?)'
        );
        $st->execute([$nome, $nascimento, $cpf, $telefone, $email, $username, password_hash($senha, PASSWORD_DEFAULT)]);
    } catch (PDOException $e) {
        
        if ($e->getCode() === '23000') {
            return falha('Username ou CPF já cadastrado.', 409);
        }
        throw $e;
    }

    return ['ok' => true, 'id' => (int) $pdo->lastInsertId()];
}


function verificar_credenciais(string $username, string $senha): ?array
{
    $st = banco()->prepare('SELECT id, senha_hash FROM usuarios WHERE LOWER(username) = LOWER(?)');
    $st->execute([trim($username)]);
    $usuario = $st->fetch();

    $senhaCorreta = password_verify($senha, $usuario ? $usuario['senha_hash'] : HASH_FALSO);
    if (!$usuario || !$senhaCorreta) {
        return null;
    }

  
    if (password_needs_rehash($usuario['senha_hash'], PASSWORD_DEFAULT)) {
        $st = banco()->prepare('UPDATE usuarios SET senha_hash = ? WHERE id = ?');
        $st->execute([password_hash($senha, PASSWORD_DEFAULT), $usuario['id']]);
    }

    return ['id' => (int) $usuario['id']];
}

/**
 * Altera nome, telefone, e-mail e (opcionalmente) a senha.
 * CPF, data de nascimento e username não mudam. Senha em branco = mantém a atual.
 */
function atualizar_usuario(int $id, array $dados): array
{
    $nome     = campo_texto($dados, 'nome');
    $telefone = campo_texto($dados, 'telefone');
    $email    = campo_texto($dados, 'email');
    $senha    = campo_senha($dados);

    $erro = validar_nome($nome)
        ?? validar_telefone($telefone)
        ?? validar_email($email)
        ?? validar_senha($senha, true);
    if ($erro !== null) {
        return falha($erro, 422);
    }

    if ($senha !== '') {
        $st = banco()->prepare('UPDATE usuarios SET nome = ?, telefone = ?, email = ?, senha_hash = ? WHERE id = ?');
        $st->execute([$nome, $telefone, $email, password_hash($senha, PASSWORD_DEFAULT), $id]);
    } else {
        $st = banco()->prepare('UPDATE usuarios SET nome = ?, telefone = ?, email = ? WHERE id = ?');
        $st->execute([$nome, $telefone, $email, $id]);
    }

    return ['ok' => true];
}
