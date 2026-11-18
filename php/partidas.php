<?php
declare(strict_types=1);



require_once __DIR__ . '/banco.php';

const PARTIDA_MODOS        = ['classico', 'bombastico'];
const PARTIDA_DIFICULDADES = ['facil', 'normal', 'dificil'];
const PARTIDA_MOTIVOS      = ['nivel', 'desistencia'];
const PARTIDA_TAMANHO_MIN  = 2;   // grade mínima (2x2), igual ao slider das configurações
const PARTIDA_TAMANHO_MAX  = 8;   // grade máxima (8x8)
const PARTIDA_LIMITE_VALOR = 1000000000; // teto dos números enviados pelo navegador

const RANKING_LIMITE   = 10;      // jogadores exibidos no ranking
const HISTORICO_LIMITE = 200;     // partidas mais recentes devolvidas no histórico


function inteiro_json(array $dados, string $chave): ?int
{
    $valor = $dados[$chave] ?? null;
    if (is_int($valor)) {
        return $valor;
    }
    if (is_float($valor) && floor($valor) === $valor && abs($valor) <= PARTIDA_LIMITE_VALOR) {
        return (int) $valor;
    }
    return null;
}

function partida_falha(string $erro): array
{
    return ['ok' => false, 'erro' => $erro, 'status' => 422];
}


function salvar_partida(int $usuarioId, array $dados): array
{
    $modo        = $dados['modo'] ?? null;
    $dificuldade = $dados['dificuldade'] ?? null;
    $motivo      = $dados['motivo'] ?? null;

    if (!in_array($modo, PARTIDA_MODOS, true)) {
        return partida_falha('Modo de jogo inválido.');
    }
    if (!in_array($dificuldade, PARTIDA_DIFICULDADES, true)) {
        return partida_falha('Dificuldade inválida.');
    }
    if (!in_array($motivo, PARTIDA_MOTIVOS, true)) {
        return partida_falha('Motivo de encerramento inválido.');
    }

    $tamanho = inteiro_json($dados, 'tamanho');
    $nivel   = inteiro_json($dados, 'nivel');
    $acertos = inteiro_json($dados, 'acertos');
    $pontos  = inteiro_json($dados, 'pontos');
    $tempo   = inteiro_json($dados, 'tempo');
    $teto    = PARTIDA_LIMITE_VALOR;

    if ($tamanho === null || $tamanho < PARTIDA_TAMANHO_MIN || $tamanho > PARTIDA_TAMANHO_MAX) {
        return partida_falha('Tamanho da grade inválido.');
    }
    if ($nivel === null || $nivel < 1 || $nivel > $teto) {
        return partida_falha('Nível inválido.');
    }
    if ($acertos === null || abs($acertos) > $teto) {
        return partida_falha('Número de acertos inválido.');
    }
    if ($pontos === null || abs($pontos) > $teto) {
        return partida_falha('Pontuação inválida.');
    }
    if ($tempo === null || $tempo < 0 || $tempo > $teto) {
        return partida_falha('Tempo de jogo inválido.');
    }

    $pdo = banco();
    $st = $pdo->prepare(
        'INSERT INTO partidas (usuario_id, modo, dificuldade, tamanho, nivel, acertos, pontos, tempo_segundos, motivo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    $st->execute([$usuarioId, $modo, $dificuldade, $tamanho, $nivel, $acertos, $pontos, $tempo, $motivo]);

    return ['ok' => true, 'id' => (int) $pdo->lastInsertId()];
}


function data_iso_utc(string $valor): string
{
    $data = DateTimeImmutable::createFromFormat('Y-m-d H:i:s', $valor, new DateTimeZone('UTC'));
    return $data ? $data->format('Y-m-d\TH:i:s\Z') : $valor;
}

function formatar_partida(array $linha): array
{
    return [
        'usuario'     => (string) $linha['usuario'],
        'modo'        => (string) $linha['modo'],
        'dificuldade' => (string) $linha['dificuldade'],
        'tamanho'     => (int) $linha['tamanho'],
        'nivel'       => (int) $linha['nivel'],
        'acertos'     => (int) $linha['acertos'],
        'pontos'      => (int) $linha['pontos'],
        'data'        => data_iso_utc((string) $linha['jogada_em']),
    ];
}


function historico_do_usuario(int $usuarioId): array
{
    $st = banco()->prepare(
        'SELECT u.username AS usuario, p.modo, p.dificuldade, p.tamanho, p.nivel, p.acertos, p.pontos, p.jogada_em
           FROM partidas p
           JOIN usuarios u ON u.id = p.usuario_id
          WHERE p.usuario_id = ?
          ORDER BY p.jogada_em DESC, p.id DESC
          LIMIT ' . HISTORICO_LIMITE
    );
    $st->execute([$usuarioId]);

    return array_map('formatar_partida', $st->fetchAll());
}

/**
 * Ranking: a melhor partida de cada jogador (maior nível; empate decidido por
 * pontos e, se ainda empatar, por quem chegou primeiro), dos melhores para os piores.
 */
function ranking_geral(): array
{
    $st = banco()->query(
        'SELECT u.username AS usuario, p.modo, p.dificuldade, p.tamanho, p.nivel, p.acertos, p.pontos, p.jogada_em
           FROM partidas p
           JOIN usuarios u ON u.id = p.usuario_id
          WHERE p.id = (
                SELECT p2.id
                  FROM partidas p2
                 WHERE p2.usuario_id = p.usuario_id
                 ORDER BY p2.nivel DESC, p2.pontos DESC, p2.id ASC
                 LIMIT 1
          )
          ORDER BY p.nivel DESC, p.pontos DESC, p.id ASC
          LIMIT ' . RANKING_LIMITE
    );

    return array_map('formatar_partida', $st->fetchAll());
}
