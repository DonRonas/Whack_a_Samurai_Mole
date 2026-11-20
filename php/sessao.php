<?php
declare(strict_types=1);



require_once __DIR__ . '/banco.php';
require_once __DIR__ . '/skins.php';

const SESSAO_NOME   = 'WAMSSESSID';
const PAGINA_LOGIN  = 'inicial.php';
const PAGINA_PRINCIPAL = 'principal.php';

function iniciar_sessao(): void
{
    if (session_status() === PHP_SESSION_ACTIVE) {
        return;
    }

    $https = !empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off';

    ini_set('session.use_strict_mode', '1');   
    ini_set('session.use_only_cookies', '1');  
    session_cache_limiter('');                 
    session_name(SESSAO_NOME);
    session_set_cookie_params([
        'lifetime' => 0,          
        'path'     => '/',
        'secure'   => $https,
        'httponly' => true,       
        'samesite' => 'Lax',      
    ]);
    session_start();
}

function enviar_cabecalhos_sem_cache(): void
{
    
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');
}


function usuario_atual(): ?array
{
    if (!isset($_COOKIE[SESSAO_NOME])) {
        return null; 
    }

    iniciar_sessao();
    $id = $_SESSION['usuario_id'] ?? null;
    if (!is_int($id)) {
        return null;
    }

    $st = banco()->prepare(
        'SELECT id, nome, nascimento, cpf, telefone, email, username FROM usuarios WHERE id = ?'
    );
    $st->execute([$id]);
    $usuario = $st->fetch();

    if (!$usuario) {
        encerrar_sessao();
        return null;
    }
    return $usuario;
}

function registrar_login(int $usuarioId): void
{
    iniciar_sessao();
    session_regenerate_id(true); 
    $_SESSION['usuario_id'] = $usuarioId;
}

function encerrar_sessao(): void
{
    iniciar_sessao();
    $_SESSION = [];

    $p = session_get_cookie_params();
    setcookie(session_name(), '', [
        'expires'  => time() - 3600,
        'path'     => $p['path'],
        'domain'   => $p['domain'],
        'secure'   => $p['secure'],
        'httponly' => $p['httponly'],
        'samesite' => $p['samesite'] ?? 'Lax',
    ]);
    session_destroy();
}


function exigir_login_pagina(): array
{
    enviar_cabecalhos_sem_cache();

    try {
        $usuario = usuario_atual();
    } catch (Throwable $e) {
        error_log('[WAMS] ' . $e->getMessage());
        http_response_code(503);
        header('Content-Type: text/plain; charset=utf-8');
        exit('Servico indisponivel: nao foi possivel acessar o banco de dados.');
    }

    if ($usuario === null) {
        header('Location: ' . PAGINA_LOGIN);
        exit;
    }
    return $usuario;
}


function redirecionar_se_logado(): void
{
    enviar_cabecalhos_sem_cache();

    try {
        $usuario = usuario_atual();
    } catch (Throwable $e) {
        $usuario = null;
    }

    if ($usuario !== null) {
        header('Location: ' . PAGINA_PRINCIPAL);
        exit;
    }
}
