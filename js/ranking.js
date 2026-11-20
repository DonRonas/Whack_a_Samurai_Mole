        (async () => {
            const grid = document.getElementById('grid-ranking');
            const r = await Armazenamento.ranking();
            const melhores = r.ok ? r.ranking : []; 

            if (melhores.length === 0) {
                const vazio = document.createElement('p');
                vazio.textContent = 'Nenhuma partida registrada ainda.';
                vazio.style.textAlign = 'center';
                grid.appendChild(vazio);
                return;
            }

            melhores.forEach((p, i) => {
                const l = document.createElement('div');
                l.className = 'linha-dados' + (i < 3 ? ' top' + (i + 1) : '');
                const textos = [(i + 1) + 'º', p.usuario, Armazenamento.rotuloModo(p), p.nivel, p.pontos];
                for (const t of textos) {
                    const c = document.createElement('div');
                    c.className = 'celula';
                    c.textContent = t;
                    l.appendChild(c);
                }
                grid.appendChild(l);
            });
        })();