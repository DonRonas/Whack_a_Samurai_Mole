<?php
declare(strict_types=1);

// GET /api/ranking.php  -> melhor partida de cada jogador, dos melhores para os piores
require_once __DIR__ . '/../php/resposta.php';
require_once __DIR__ . '/../php/partidas.php';

exigir_metodo('GET');

exigir_login_api();

responder(['ok' => true, 'ranking' => ranking_geral()]);
