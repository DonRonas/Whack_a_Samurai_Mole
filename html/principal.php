<?php
    require __DIR__ . '/../php/sessao.php';
    $usuario = exigir_login_pagina();
?>

<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Interface do Jogo</title>
    <link rel="icon" type="image/x-icon" href="../img/topeira_samurai.png">   
    <link rel="stylesheet" href="../css/principal.css">
    <link rel="stylesheet" href="../css/tabuleiro.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Tiny5&display=swap" rel="stylesheet">
</head>
<body data-usuario="<?= htmlspecialchars($usuario['username'], ENT_QUOTES, 'UTF-8') ?>">

    <div class="interface_jogo">

        <div class="titulo-jogo">
            <h1>Whack a Mole Samurai - Clássico</h1>
        </div>
        
        <header class="hud-topo">
            <div class="status-box">
                <p>Nivel: <span id="hud-nivel">1</span></p>
                <p>Tempo restante: <span id="hud-tempo">20s</span></p>
                <p>Meta para passar: <span id="hud-meta">70%</span></p>
            </div>
           
            <div class="status-box">
                <p>Score: <span id="hud-score">0</span></p>
                <p>Acertos: <span id="hud-kills">0</span></p>
                <p>Acertos no nível: <span id="hud-pct">0%</span></p>
            </div>
        </header>

  
        <div class="area-central">
            

            <main class="tabuleiro-container">
                <div class="borda-tabuleiro">
                    <div id="tabuleiro" class="tabuleiro" aria-label="tabuleiro do jogo"></div>

                    <div id="faixa" class="faixa" aria-live="polite"></div>
                    <div id="mensagem" class="mensagem" hidden>
                        <h2 id="mensagem-titulo"></h2>
                        <p id="mensagem-texto"></p>
                        <button type="button" id="mensagem-botao" class="botao-jogo"></button>
                        <button type="button" id="mensagem-botao2" class="botao-jogo" hidden></button>
                    </div>
                </div>
            </main>


            <aside class="menu-lateral">
                <h2>MENU</h2>
                <nav>
                    <ol>
                        <li><p class="tipo_jogo">[ Modos ]</p></li>
                        <li><p class="opcao-sub" id="classico">- Clássico</p></li>
                        <li><p class="opcao-sub" id="bombastico">- Bombástico</p></li>
                    </ol>
                        <hr class="linha">
                    <ol>
                        <li><a href="skins.php">Skins</a></li>
                        <li><a href="bestiario.php">Bestiário</a></li>
                        <li><a href="ranking.php">Ranking</a></li>
                        <li><a href="historico.php">Histórico</a></li>
                        <li><a href="configuracoes.php">Configurações</a></li>
                    </ol>
                        <hr class="linha">
                    <ol>
                        <li><a href="creditos.php">Créditos</a></li>
                        <li><a href="alteracao_cadastro.php">Alterar Cadastro</a></li>
                        <li class="sair"><a href="inicial.php">Sair</a></li>
                    </ol>
                </nav>
            </aside>
        </div>


        <footer class="hud-rodape">
            <label for="progresso-fase">Progresso da Fase</label>
            <progress id="progresso-fase" value="0" max="100"></progress>
        </footer>

        <div class="desistir-fase" id="btn-seppuku">
                <p>SEPPUKU</p>
        </div>

    </div>

    <script src="../js/storage.js"></script>
    <script src="../js/opcoes.js"></script>
    <script src="../js/toupeiras.js"></script>
    <script src="../js/balanceamento.js"></script>
    <script src="../js/jogo.js"></script>
    <script src="../js/principal.js"></script>


</body>
</html>