<?php
    require __DIR__ . '/../php/sessao.php';
    $usuario = exigir_login_pagina();
    $pontos  = skins_pontos((int) $usuario['id']);
    $skins   = skins_do_usuario((int) $usuario['id']);
?>

<!DOCTYPE html>
<html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Skins</title>
        <link rel="icon" type="image/x-icon" href="../img/topeira_samurai.png">
       
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Tiny5&display=swap" rel="stylesheet">
        
        <link rel="stylesheet" href="../css/skins.css">
<?= skins_estilo() ?>
    </head>
    <body class="body">
        
        <section class="listaskin">
            <h1>Skins</h1>
            <p class="pontos">Seus pontos: <?= $pontos ?></p>
            <p id="mensagem-skins" role="alert" class="aviso-skins"></p>

            <?php foreach (SKIN_TIPOS as $tipo => $titulo): ?>
            <ul>
                <li>
                <h2><?= htmlspecialchars($titulo) ?>:</h2>
                <div class="lista">
                    <?php foreach ($skins as $s): if ($s['tipo'] !== $tipo) continue; ?>
                    <div class="item">
                        <div class="skins" style="<?= htmlspecialchars($s['previa']) ?>"></div>
                        <p class="nome"><?= htmlspecialchars($s['nome']) ?></p>
                        <p><?= htmlspecialchars($s['descricao']) ?></p>
                        <?php if (!$s['comprada']): ?>
                            <button class="comprar" data-skin="<?= htmlspecialchars($s['id']) ?>" data-acao="comprar"
                                <?= $pontos < $s['custo'] ? 'disabled title="Pontos insuficientes"' : '' ?>>Comprar: <?= $s['custo'] ?> pontos</button>
                        <?php elseif ($s['equipada']): ?>
                            <button class="equipar" data-skin="<?= htmlspecialchars($s['id']) ?>" data-acao="desequipar">Equipada (desequipar)</button>
                        <?php else: ?>
                            <button class="equipar" data-skin="<?= htmlspecialchars($s['id']) ?>" data-acao="equipar">Equipar</button>
                        <?php endif; ?>
                    </div>
                    <?php endforeach; ?>
                </div>
                </li>
            </ul>

                <hr class="linha">

            <?php endforeach; ?>

            <p class="acoes">
                <a href="principal.php" class="link-voltar">Voltar ao Jogo</a>
            </p>
        </section>

        <script src="../js/storage.js"></script>
        <script>
            document.querySelectorAll('button[data-acao]').forEach((b) => {
                b.addEventListener('click', async () => {
                    b.disabled = true;
                    const r = await Armazenamento.skinAcao(b.dataset.skin, b.dataset.acao);
                    if (r.ok) { window.location.reload(); return; }
                    document.getElementById('mensagem-skins').textContent = r.erro;
                    b.disabled = false;
                });
            });
        </script>
    </body>
</html>