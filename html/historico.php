<?php
    require __DIR__ . '/../php/sessao.php';
    exigir_login_pagina();
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Histórico de Partidas</title>
    <link rel="icon" type="image/x-icon" href="../img/topeira_samurai.png">   
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Tiny5&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="../css/historico.css">
</head>
<body>
    <header>
        <h1>Whack a Mole Samurai</h1>
    </header>
    
    <main>
        <div class="box">
            <h2>Histórico de Partidas</h2>
            
            <div class="tabela-container">
                <div class="grid-historico" id="grid-historico"></div>
            </div>

            <p class="acoes">
                <a href="principal.php" class="link-voltar">Voltar ao Jogo</a>
            </p>
        </div>
    </main>

    <script src="../js/storage.js"></script>
    <script src="../js/historico.js"></script>
</body>
</html>
