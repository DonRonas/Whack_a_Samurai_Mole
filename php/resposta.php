<?php
declare(strict_types=1);



ini_set('display_errors', '0'); 

require_once __DIR__ . '/sessao.php';

function responder(array $dados, int $status = 200): void
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    enviar_cabecalhos_sem_cache();
    echo json_encode($dados, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_INVALID_UTF8_SUBSTITUTE);
    exit;
}

function responder_erro(string $mensagem, int $status = 400, array $extra = []): void
{
    responder(array_merge(['ok' => false, 'erro' => $mensagem], $extra), $status);
}


set_exception_handler(function (Throwable $e): void {
    error_log('[WAMS] ' . get_class($e) . ': ' . $e->getMessage() . ' em ' . $e->getFile() . ':' . $e->getLine());
    responder_erro('Erro interno do servidor. Tente novamente mais tarde.', 500);
});

function exigir_metodo(string $metodo): void
{
    if (($_SERVER['REQUEST_METHOD'] ?? '') !== $metodo) {
        header('Allow: ' . $metodo);
        responder_erro('Método não permitido.', 405);
    }
}


function ler_corpo_json(): array
{
    $tipo = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';
    if (stripos($tipo, 'application/json') !== 0) {
        responder_erro('O Content-Type da requisição deve ser application/json.', 415);
    }

    $bruto = file_get_contents('php://input', false, null, 0, 65537);
    if ($bruto === false || strlen($bruto) > 65536) {
        responder_erro('Requisição grande demais.', 413);
    }

    $dados = json_decode($bruto, true);
    if (!is_array($dados)) {
        responder_erro('JSON inválido.', 400);
    }
    return $dados;
}


function exigir_login_api(): array
{
    $usuario = usuario_atual();
    if ($usuario === null) {
        responder_erro('Sessão expirada. Faça login novamente.', 401, ['sessao_expirada' => true]);
    }
    return $usuario;
}
