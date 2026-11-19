<?php
declare(strict_types=1);

// POST /api/skin_acao.php  { skin, acao }   acao = comprar | equipar | desequipar
require_once __DIR__ . '/../php/resposta.php';
require_once __DIR__ . '/../php/validacao.php';

exigir_metodo('POST');

$usuario = exigir_login_api();
$dados   = ler_corpo_json();

$resultado = skin_acao((int) $usuario['id'], campo_texto($dados, 'skin'), campo_texto($dados, 'acao'));
if (!$resultado['ok']) {
    responder_erro($resultado['erro'], $resultado['status']);
}

responder(['ok' => true]);
