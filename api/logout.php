<?php
declare(strict_types=1);

// POST /api/logout.php  {}
require_once __DIR__ . '/../php/resposta.php';

exigir_metodo('POST');
ler_corpo_json(); // só para exigir Content-Type JSON (proteção contra CSRF)

if (isset($_COOKIE[SESSAO_NOME])) {
    encerrar_sessao();
}

responder(['ok' => true]);
