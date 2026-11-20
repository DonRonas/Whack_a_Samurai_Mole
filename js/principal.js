        (() => {
            const btnClassico = document.getElementById('classico');
            const btnBombastico = document.getElementById('bombastico');
            const tituloJogo = document.querySelector('.titulo-jogo h1');

            function atualizarVisual(usarBomba) {
                tituloJogo.textContent = usarBomba ? 'Whack a Mole Samurai - Bombástico' : 'Whack a Mole Samurai - Clássico';
                
                btnClassico.style.fontWeight = usarBomba ? 'normal' : 'bold';
                btnBombastico.style.fontWeight = usarBomba ? 'bold' : 'normal';
                
                btnClassico.textContent = usarBomba ? 'Clássico' : '> Clássico <';
                btnBombastico.textContent = usarBomba ? '> Bombástico <' : 'Bombástico';
            }

            function trocarModo(usarBomba) {
                let opcoes = Opcoes.carregar();
                
                if (opcoes.bomba === usarBomba) return; 

                opcoes.bomba = usarBomba;
                Opcoes.salvar(opcoes);

                window.location.reload();
            }

            btnClassico.addEventListener('click', () => trocarModo(false));
            btnBombastico.addEventListener('click', () => trocarModo(true));

            atualizarVisual(Opcoes.carregar().bomba);

            document.querySelector('.sair a').addEventListener('click', (e) => {
                e.preventDefault();
                Armazenamento.logout();
            });
        })();