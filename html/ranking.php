<?php
    require __DIR__ . '/../php/sessao.php';
    exigir_login_pagina();
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Ranking Global</title>
    <link rel="icon" type="image/x-icon" href="../img/topeira_samurai.png">  
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Tiny5&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="../css/ranking.css">
<?= skins_estilo() ?>
</head>
<body>
    <header>
        <h1>Whack a Mole Samurai</h1>
    </header>
    
    <main>
        <div class="box">
            <h2>Ranking Global</h2>
            
            <div class="tabela-container">
                <div class="grid-ranking" id="grid-ranking">
                    <!-- Cabeçalho -->
                    <div class="linha-cabecalho">
                        <div class="celula">Pos</div>
                        <div class="celula">Samurai</div>
                        <div class="celula">Modo</div>
                        <div class="celula">Nível</div>
                        <div class="celula">Pontos</div>
                    </div>
                </div>
            </div>

            <p class="acoes">
                <a href="principal.php" class="link-voltar">Voltar para o Menu</a>
            </p>
        </div>
    </main>

    <script src="../js/storage.js"></script>
    <script src="../js/ranking.js"></script>

</body>
</html>
