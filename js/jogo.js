(() => {
  'use strict';

  const { TIPOS, POR_ID, ARQUEIRA_REDUCAO } = Toupeiras;
  const B = Balanceamento;
  const opcoes = Opcoes.carregar();

  const N = opcoes.tamanho;
  const TOTAL = N * N;
  const DIFICULDADE = opcoes.dificuldade;

  const DIAGONAL_E_ADJACENTE = false;
  const OCUPACAO_MAXIMA = 0.6;
  const PAUSA_ENTRE_NIVEIS = 2;

  const maxSimultaneas = Math.max(1, Math.floor(TOTAL * OCUPACAO_MAXIMA));
  const limiteFugas = B.limiteDeFugas(TOTAL);
  const PIXEL_VAZIO = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

  const $ = (id) => document.getElementById(id);
  const el = {
    tabuleiro: $('tabuleiro'),
    nivel: $('hud-nivel'), tempo: $('hud-tempo'), fugas: $('hud-fugas'),
    score: $('hud-score'), kills: $('hud-kills'), acuracia: $('hud-acuracia'),
    progresso: $('progresso-fase'),
    mensagem: $('mensagem'), msgTitulo: $('mensagem-titulo'),
    msgTexto: $('mensagem-texto'), msgBotao: $('mensagem-botao'),
    faixa: $('faixa'), seppuku: $('btn-seppuku'),
  };

  const buracos = [];

  function construirTabuleiro() {
    el.tabuleiro.style.setProperty('--n', N);
    el.tabuleiro.textContent = '';
    buracos.length = 0;

    for (let i = 0; i < TOTAL; i++) {
      const celula = document.createElement('div');
      celula.className = 'celula';
      celula.innerHTML =
        '<div class="buraco"></div>' +
        '<div class="corte"><img class="toupeira" alt="" draggable="false" src="' + PIXEL_VAZIO + '"></div>';

      const sprite = celula.querySelector('.toupeira');
      sprite.dataset.indice = i;
      el.tabuleiro.appendChild(celula);

      buracos.push({ indice: i, linha: Math.floor(i / N), coluna: i % N, sprite, toupeira: null, vizinhos: [] });
    }

    for (const b of buracos) b.vizinhos = calcularVizinhos(b);
  }

  function calcularVizinhos(b) {
    const lista = [];
    for (let dl = -1; dl <= 1; dl++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dl === 0 && dc === 0) continue;
        if (!DIAGONAL_E_ADJACENTE && dl !== 0 && dc !== 0) continue;
        const l = b.linha + dl, c = b.coluna + dc;
        if (l < 0 || l >= N || c < 0 || c >= N) continue;
        lista.push(buracos[l * N + c]);
      }
    }
    return lista;
  }

  let partida;
  let rafId = 0, ultimoQuadro = 0;

  function novaPartida() {
    const semAparecer = {};
    TIPOS.forEach((t) => (semAparecer[t.id] = 0));
    partida = {
      situacao: 'espera',
      nivel: 1,
      tempo: 0,
      score: 0, kills: 0, killsNoNivel: 0,
      cliques: 0, acertos: 0,
      fugas: 0,
      contagemSpawn: 1,
      bloqueio: 0,
      semAparecer,
      ultimoTempoMostrado: -1,
    };
  }

  const aleatorio = (lista) => lista[Math.floor(Math.random() * lista.length)];
  const contarTipo = (id) => buracos.filter((b) => b.toupeira && b.toupeira.tipo.id === id).length;
  const quantasNoTabuleiro = () => buracos.filter((b) => b.toupeira).length;

  function tentarSpawn() {
    const livres = buracos.filter((b) => !b.toupeira);
    if (livres.length === 0 || quantasNoTabuleiro() >= maxSimultaneas) return null;

    const chances = B.calcularChances(DIFICULDADE, partida.nivel, partida.semAparecer, contarTipo('demonio'));
    const id = B.sortearTipo(chances, Math.random() * 100);

    for (const t of TIPOS) partida.semAparecer[t.id] = t.id === id ? 0 : partida.semAparecer[t.id] + 1;

    return criarToupeira(POR_ID[id], aleatorio(livres));
  }

  function criarToupeira(tipo, buraco) {
    let restante = B.tempoDePermanencia(DIFICULDADE, partida.nivel) + tipo.ajusteTempo;

    for (const v of buraco.vizinhos) {
      if (v.toupeira && v.toupeira.tipo.habilidade === 'arqueira') restante -= ARQUEIRA_REDUCAO;
    }
    restante = Math.max(B.TEMPO_MINIMO_ABSOLUTO, restante);

    const m = { tipo, buraco, restante, vida: tipo.vida, acabando: false };
    buraco.toupeira = m;
    mostrar(buraco);

    if (tipo.habilidade === 'arqueira') {
      for (const v of buraco.vizinhos) if (v.toupeira) encurtar(v.toupeira, ARQUEIRA_REDUCAO);
    } else if (tipo.habilidade === 'demonio') {
      espantarVizinhas(buraco);
    }
    return m;
  }

  function encurtar(m, seg) {
    m.restante = Math.min(m.restante, Math.max(0.3, m.restante - seg));
  }

  function espantarVizinhas(demonio) {
    const alvos = demonio.vizinhos.filter((v) => v.toupeira).map((v) => v.toupeira);
    for (const m of alvos) {
      const livres = buracos.filter((b) => !b.toupeira && b !== demonio);
      if (livres.length === 0) break;
      const longe = livres.filter((b) => !demonio.vizinhos.includes(b));
      mover(m, aleatorio(longe.length ? longe : livres));
    }
  }

  function mover(m, destino) {
    const origem = m.buraco;
    origem.toupeira = null;
    esconder(origem);
    destino.toupeira = m;
    m.buraco = destino;
    mostrar(destino);
  }

  function mostrar(b) {
    const s = b.sprite, m = b.toupeira;
    s.src = m.tipo.img;
    s.alt = m.tipo.nome;
    s.className = 'toupeira';
    if (m.vida < m.tipo.vida) s.classList.add('ferida');
    void s.offsetWidth;
    s.classList.add('up');
  }

  function esconder(b, morta) {
    b.sprite.classList.remove('up', 'acabando');
    if (morta) {
      b.sprite.classList.add('morta');
      setTimeout(() => { if (!b.toupeira) b.sprite.className = 'toupeira'; }, 260);
    }
  }

  function limparTabuleiro() {
    for (const b of buracos) {
      if (b.toupeira) { b.toupeira = null; esconder(b); }
    }
  }

  el.tabuleiro.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 || partida.situacao !== 'jogando') return;
    partida.cliques++;

    const sprite = e.target.closest('.toupeira');
    const b = sprite && buracos[Number(sprite.dataset.indice)];
    const m = b && b.toupeira;

    if (!m) { atualizarHUD(); return; }

    partida.acertos++;
    m.vida--;
    if (m.vida > 0) {
      sprite.classList.add('ferida');
      sprite.classList.remove('bateu'); void sprite.offsetWidth; sprite.classList.add('bateu');
    } else {
      matar(m);
    }
    atualizarHUD();
  });

  function matar(m) {
    m.buraco.toupeira = null;
    esconder(m.buraco, true);
    partida.kills++;
    partida.killsNoNivel++;
    partida.score += m.tipo.pontos;
    if (partida.killsNoNivel >= B.metaDeKills(partida.nivel)) subirDeNivel();
  }

  function quadro(agora) {
    rafId = requestAnimationFrame(quadro);
    const dt = Math.min((agora - ultimoQuadro) / 1000, 0.1);
    ultimoQuadro = agora;
    if (partida.situacao === 'jogando') atualizar(dt);
  }

  function atualizar(dt) {
    partida.tempo += dt;

    for (const b of buracos) {
      const m = b.toupeira;
      if (!m) continue;
      m.restante -= dt;
      if (m.restante <= 0) { fugir(m); if (partida.situacao !== 'jogando') return; continue; }
      const acabando = m.restante < 1;
      if (acabando !== m.acabando) { m.acabando = acabando; b.sprite.classList.toggle('acabando', acabando); }
    }

    // 2) Hora de aparecer outra?
    if (partida.bloqueio > 0) {
      partida.bloqueio -= dt;
    } else {
      partida.contagemSpawn -= dt;
      if (partida.contagemSpawn <= 0) {
        tentarSpawn();
        partida.contagemSpawn = B.intervaloDeSpawn(DIFICULDADE, partida.nivel, TOTAL);
      }
    }

    if (Math.floor(partida.tempo) !== partida.ultimoTempoMostrado) atualizarHUD();
  }

  function fugir(m) {
    m.buraco.toupeira = null;
    esconder(m.buraco);
    partida.fugas++;
    atualizarHUD();
    if (partida.fugas >= limiteFugas) fimDeJogo('fugas');
  }

  function subirDeNivel() {
    partida.nivel++;
    partida.killsNoNivel = 0;
    partida.fugas = 0;
    partida.bloqueio = PAUSA_ENTRE_NIVEIS;
    partida.contagemSpawn = 0.5;
    limparTabuleiro();
    mostrarFaixa('NÍVEL ' + partida.nivel);
  }

  function atualizarHUD() {
    el.nivel.textContent = partida.nivel;
    partida.ultimoTempoMostrado = Math.floor(partida.tempo);
    el.tempo.textContent = partida.ultimoTempoMostrado + 's';
    el.score.textContent = partida.score;
    el.kills.textContent = partida.kills;
    el.fugas.textContent = partida.fugas + '/' + limiteFugas;
    el.acuracia.textContent = (partida.cliques ? Math.round((partida.acertos / partida.cliques) * 100) : 100) + '%';
    el.progresso.value = Math.min(100, (partida.killsNoNivel / B.metaDeKills(partida.nivel)) * 100);
  }

  function mostrarMensagem(titulo, texto, rotuloBotao, aoClicar) {
    el.msgTitulo.textContent = titulo;
    el.msgTexto.textContent = texto;
    el.msgBotao.textContent = rotuloBotao;
    el.msgBotao.onclick = aoClicar;
    el.mensagem.hidden = false;
    el.msgBotao.focus();
  }
  const esconderMensagem = () => { el.mensagem.hidden = true; };

  function mostrarFaixa(texto) {
    el.faixa.textContent = texto;
    el.faixa.classList.remove('mostrar'); void el.faixa.offsetWidth; el.faixa.classList.add('mostrar');
  }

  function iniciar() {
    novaPartida();
    limparTabuleiro();
    partida.situacao = 'jogando';
    esconderMensagem();
    atualizarHUD();
    ultimoQuadro = performance.now();
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(quadro);
  }

  function pausar() {
    if (partida.situacao !== 'jogando') return;
    partida.situacao = 'pausado';
    mostrarMensagem('PAUSADO', 'O tempo das toupeiras está congelado.', 'Continuar', retomar);
  }

  function retomar() {
    if (partida.situacao !== 'pausado') return;
    partida.situacao = 'jogando';
    ultimoQuadro = performance.now();
    esconderMensagem();
  }

  function fimDeJogo(motivo) {
    if (partida.situacao === 'fim') return;
    partida.situacao = 'fim';
    cancelAnimationFrame(rafId);
    limparTabuleiro();

    const acuracia = partida.cliques ? Math.round((partida.acertos / partida.cliques) * 100) : 0;
    const resumo = 'Nível ' + partida.nivel + '  •  Score ' + partida.score +
                   '  •  Kills ' + partida.kills + '  •  Acurácia ' + acuracia + '%';
    mostrarMensagem(motivo === 'desistencia' ? 'SEPPUKU' : 'FIM DE JOGO', resumo, 'Jogar de novo', iniciar);

    document.dispatchEvent(new CustomEvent('jogo:fim', {
      detail: {
        motivo, modo: 'classico', dificuldade: DIFICULDADE, tamanho: N,
        nivel: partida.nivel, score: partida.score, kills: partida.kills,
        acuracia, tempo: Math.floor(partida.tempo),
      },
    }));
  }

  el.seppuku.addEventListener('click', () => {
    if (partida.situacao === 'jogando' || partida.situacao === 'pausado') fimDeJogo('desistencia');
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key.toLowerCase() === 'p') {
      partida.situacao === 'jogando' ? pausar() : retomar();
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && opcoes.pausaAuto) pausar();
  });

  TIPOS.forEach((t) => { new Image().src = t.img; });
  construirTabuleiro();
  novaPartida();
  atualizarHUD();
  mostrarMensagem(
    'PRONTO?',
    N + 'x' + N + '  •  ' + { facil: 'Fácil', normal: 'Normal', dificil: 'Difícil' }[DIFICULDADE] +
      '  •  Esc ou P pausa',
    'Começar',
    iniciar
  );

  window.Jogo = {
    get partida() { return partida; },
    buracos,
    iniciar, pausar, retomar,
    criarToupeira: (id, indice) => criarToupeira(POR_ID[id], buracos[indice]),
    tentarSpawn,
  };
})();
