<?php
declare(strict_types=1);

//Skins: catálogo, compra, equipar e css das skins equipadas

require_once __DIR__ . '/banco.php';

const SKIN_TIPOS = ['martelo' => 'Martelos', 'tabuleiro' => 'Tabuleiros', 'background' => 'Backgrounds'];

function skins_catalogo(): array
{
    return [
        'martelo_dragao' => [
            'tipo' => 'martelo', 'nome' => 'Pilar do Imperador Dragão', 'custo' => 500,
            'descricao' => 'Roubado pelo próprio Sun Toupeikong, essa arma formidável esmaga qualquer inimigo.',
            'previa' => "background: url('../img/pilarDragao.png') center / contain no-repeat #5a8f9b;",
            'css'    => "* { cursor: url('../img/pilarDragao.png') 16 16, auto !important; }",
        ],
        'tabuleiro_carmesim' => [
            'tipo' => 'tabuleiro', 'nome' => 'Terra Carmesim', 'custo' => 300,
            'descricao' => 'Solo tingido pelo sangue de mil batalhas.',
            'previa' => "background: #c0392b url('../img/terra.png'); background-size: 160px auto; background-blend-mode: multiply;",
            'css'    => ".tabuleiro { background-color: #c0392b; background-blend-mode: multiply; }",
        ],
        'tabuleiro_jade' => [
            'tipo' => 'tabuleiro', 'nome' => 'Jardim de Jade', 'custo' => 600,
            'descricao' => 'Um jardim tranquilo... até as toupeiras aparecerem.',
            'previa' => "background: #3fa66b url('../img/terra.png'); background-size: 160px auto; background-blend-mode: multiply;",
            'css'    => ".tabuleiro { background-color: #3fa66b; background-blend-mode: multiply; }",
        ],
        'background_templo' => [
            'tipo' => 'background', 'nome' => 'Templo ao Amanhecer', 'custo' => 400,
            'descricao' => 'O dojo onde todo samurai começa o treino.',
            'previa' => "background: url('../img/fundo2.jpg') center / cover;",
            'css'    => ".interface_jogo { background-image: url('../img/fundo2.jpg'); }",
        ],
        'background_noite' => [
            'tipo' => 'background', 'nome' => 'Noite no Deserto', 'custo' => 800,
            'descricao' => 'A lua alta guia quem caça toupeiras no escuro.',
            'previa' => "background: linear-gradient(#0b1026, #2b1b4a 60%, #6b2d5c);",
            'css'    => ".interface_jogo { background-image: linear-gradient(#0b1026, #2b1b4a 60%, #6b2d5c); }",
        ],
    ];
}

function skins_pontos(int $usuarioId): int
{
    $st = banco()->prepare('SELECT COALESCE(SUM(GREATEST(pontos, 0)), 0) FROM partidas WHERE usuario_id = ?');
    $st->execute([$usuarioId]);
    return (int) $st->fetchColumn();
}

function skins_do_usuario(int $usuarioId): array
{
    $st = banco()->prepare('SELECT skin_id, equipada FROM usuario_skins WHERE usuario_id = ?');
    $st->execute([$usuarioId]);
    $minhas = [];
    foreach ($st->fetchAll() as $l) {
        $minhas[$l['skin_id']] = (bool) $l['equipada'];
    }

    $lista = [];
    foreach (skins_catalogo() as $id => $skin) {
        $skin['id']       = $id;
        $skin['comprada'] = array_key_exists($id, $minhas);
        $skin['equipada'] = $minhas[$id] ?? false;
        $lista[$id] = $skin;
    }
    return $lista;
}

function skin_acao(int $usuarioId, string $id, string $acao): array
{
    $catalogo = skins_catalogo();
    if (!isset($catalogo[$id])) {
        return ['ok' => false, 'erro' => 'Skin inexistente.', 'status' => 404];
    }
    $skin = $catalogo[$id];
    $pdo  = banco();

    if ($acao === 'comprar') {
        if (skins_pontos($usuarioId) < $skin['custo']) {
            return ['ok' => false, 'erro' => 'Você precisa de ' . $skin['custo'] . ' pontos para comprar esta skin.', 'status' => 403];
        }
        try {
            $st = $pdo->prepare('INSERT INTO usuario_skins (usuario_id, skin_id, tipo, equipada) VALUES (?, ?, ?, 0)');
            $st->execute([$usuarioId, $id, $skin['tipo']]);
        } catch (PDOException $e) {
            if ($e->getCode() === '23000') {
                return ['ok' => false, 'erro' => 'Você já possui esta skin.', 'status' => 409];
            }
            throw $e;
        }
        return ['ok' => true];
    }

    if ($acao !== 'equipar' && $acao !== 'desequipar') {
        return ['ok' => false, 'erro' => 'Ação inválida.', 'status' => 422];
    }

    $st = $pdo->prepare('SELECT 1 FROM usuario_skins WHERE usuario_id = ? AND skin_id = ?');
    $st->execute([$usuarioId, $id]);
    if (!$st->fetchColumn()) {
        return ['ok' => false, 'erro' => 'Compre a skin antes de equipar.', 'status' => 403];
    }

    if ($acao === 'desequipar') {
        $pdo->prepare('UPDATE usuario_skins SET equipada = 0 WHERE usuario_id = ? AND skin_id = ?')
            ->execute([$usuarioId, $id]);
        return ['ok' => true];
    }

    //so uma skin equipada por tipo.
    $pdo->beginTransaction();
    try {
        $pdo->prepare('UPDATE usuario_skins SET equipada = 0 WHERE usuario_id = ? AND tipo = ?')
            ->execute([$usuarioId, $skin['tipo']]);
        $pdo->prepare('UPDATE usuario_skins SET equipada = 1 WHERE usuario_id = ? AND skin_id = ?')
            ->execute([$usuarioId, $id]);
        $pdo->commit();
    } catch (Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
    return ['ok' => true];
}

function skins_estilo(): string
{
    try {
        $usuario = usuario_atual();
        if ($usuario === null) {
            return '';
        }
        $st = banco()->prepare('SELECT skin_id FROM usuario_skins WHERE usuario_id = ? AND equipada = 1');
        $st->execute([(int) $usuario['id']]);
        $catalogo = skins_catalogo();
        $regras = [];
        foreach ($st->fetchAll(PDO::FETCH_COLUMN) as $id) {
            if (isset($catalogo[$id])) {
                $regras[] = $catalogo[$id]['css'];
            }
        }
    } catch (Throwable $e) {
        error_log('[WAMS] skins: ' . $e->getMessage());
        return '';
    }

    return $regras ? "<style>\n" . implode("\n", $regras) . "\n</style>\n" : '';
}
