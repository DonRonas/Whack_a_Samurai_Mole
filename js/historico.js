        (async () => {
            const grid = document.getElementById('grid-historico');
            const COLUNAS = 7;
            const colunasCss = 'repeat(' + COLUNAS + ', 1fr)';

            function linha(classe, textos) {
                const l = document.createElement('div');
                l.className = classe;
                l.style.gridTemplateColumns = colunasCss; // 7 colunas, independente do CSS
                for (const t of textos) {
                    const c = document.createElement('div');
                    c.className = 'celula';
                    c.textContent = t;
                    l.appendChild(c);
                }
                grid.appendChild(l);
            }

            linha('linha-cabecalho', ['Data/Hora', 'Jogador', 'Modo', 'Grade', 'Nível', 'Acertos', 'Pontos']);

            const r = await Armazenamento.historico();
            const partidas = r.ok ? r.partidas : [];
            if (partidas.length === 0) {
                const vazio = document.createElement('p');
                vazio.textContent = 'Nenhuma partida jogada ainda.';
                vazio.style.textAlign = 'center';
                grid.appendChild(vazio);
                return;
            }

            for (const p of partidas) {
                linha('linha-dados', [
                    Armazenamento.formatarData(p.data),
                    p.usuario,
                    Armazenamento.rotuloModo(p),
                    p.tamanho + 'x' + p.tamanho,
                    p.nivel,
                    p.acertos,
                    p.pontos,
                ]);
            }
        })();