(() => {
  'use strict';

  const { TIPOS, POR_ID, ARQUEIRA_REDUCAO } = Toupeiras;
  const B = Balanceamento;
  const opcoes = Opcoes.carregar();

  const N = opcoes.tamanho;
  const TOTAL = N * N;
  const DIFICULDADE = opcoes.dificuldade;
  const MODO = opcoes.bomba ? 'bombastico' : 'classico';

  // nova dinâmica: cada nível dura DURACAO segundos e exige PERCENTUAL_META % de acertos
  const DURACAO = B.DURACAO_NIVEL;
  const PERCENTUAL_META = B.percentualParaPassar(DIFICULDADE);

  const DIAGONAL_E_ADJACENTE = false;
  const OCUPACAO_MAXIMA = 0.6;
  const PAUSA_ENTRE_NIVEIS = 2;

  const maxSimultaneas = Math.max(1, Math.floor(TOTAL * OCUPACAO_MAXIMA));
  const PIXEL_VAZIO = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

  const $ = (id) => document.getElementById(id);
  const el = {
    tabuleiro: $('tabuleiro'),
    nivel: $('hud-nivel'), tempo: $('hud-tempo'), meta: $('hud-meta'),
    score: $('hud-score'), kills: $('hud-kills'), pct: $('hud-pct'),
    progresso: $('progresso-fase'),
    mensagem: $('mensagem'), msgTitulo: $('mensagem-titulo'),
    msgTexto: $('mensagem-texto'), msgBotao: $('mensagem-botao'), msgBotao2: $('mensagem-botao2'),
    faixa: $('faixa'), seppuku: $('btn-seppuku'),
  };

  const buracos = [];

  function construirTabuleiro() { //faz o tabuleiro de qualquer tamanho com uma textura simples
    el.tabuleiro.style.setProperty('--n', N); //pra arte so tem que fazer algumas texturas diferentes
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

  function calcularVizinhos(b) { //mapeia os lugares para as habilidades das toupeiras funcionarem
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
      tempo: 0,                 // tempo total jogado (s)
      tempoNivel: DURACAO,      // tempo restante do nível atual (s)
      score: 0,                 // pontos (por tipo de toupeira)
      kills: 0,                 // total de toupeiras acertadas (bomba desconta 1)
      exibidasNivel: 0,         // toupeiras exibidas no nível (bombas não contam)
      acertosNivel: 0,          // toupeiras acertadas no nível (bomba desconta 1)
      cliques: 0, acertos: 0,   // só para a acurácia mostrada no fim
      contagemSpawn: 1,
      bloqueio: 0,
      semAparecer,
      ultimoTempoMostrado: -1,
      salva: false,
    };
  }

  const aleatorio = (lista) => lista[Math.floor(Math.random() * lista.length)];
  const contarTipo = (id) => buracos.filter((b) => b.toupeira && b.toupeira.tipo.id === id).length;
  const quantasNoTabuleiro = () => buracos.filter((b) => b.toupeira).length;

  function tentarSpawn() {
    // não surge toupeira nova se ela não teria o tempo cheio (tt) para ser acertada antes do nível acabar
    if (partida.tempoNivel <= B.tempoDePermanencia(DIFICULDADE, partida.nivel)) return null;

    const livres = buracos.filter((b) => !b.toupeira);
    if (livres.length === 0 || quantasNoTabuleiro() >= maxSimultaneas) return null;

    const chances = B.calcularChances(DIFICULDADE, partida.nivel, partida.semAparecer, contarTipo('demonio'), opcoes.bomba);
    const id = B.sortearTipo(chances, Math.random() * 100);

    for (const t of TIPOS) partida.semAparecer[t.id] = t.id === id ? 0 : partida.semAparecer[t.id] + 1;

    const m = criarToupeira(POR_ID[id], aleatorio(livres));
    if (id !== 'bomba') partida.exibidasNivel++;
    return m;
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
    if (e.button !== 0 || partida.situacao !== 'jogando' || partida.bloqueio > 0) return;
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

  function matar(m) { //sistema de pontos e bomba ao clicar
    m.buraco.toupeira = null;
    esconder(m.buraco, true);
    if (m.tipo.id === 'bomba') {
      partida.score -= 100;
      partida.kills--;          // bomba: placar de acertos -1
      partida.acertosNivel--;   // o placar do nível pode ficar negativo
    } else {
      partida.kills++;
      partida.acertosNivel++;
      partida.score += m.tipo.pontos;
    }
  }

  function quadro(agora) {
    rafId = requestAnimationFrame(quadro);
    const dt = Math.min((agora - ultimoQuadro) / 1000, 0.1);
    ultimoQuadro = agora;
    if (partida.situacao === 'jogando') atualizar(dt);
  }

  function atualizar(dt) {
    if (partida.bloqueio > 0) { //pausa curta entre níveis: relógio do nível parado
      partida.bloqueio -= dt;
      return;
    }

    partida.tempo += dt;
    partida.tempoNivel -= dt;

    for (const b of buracos) {
      const m = b.toupeira;
      if (!m) continue;
      m.restante -= dt;
      if (m.restante <= 0) { sumir(m); continue; } // a toupeira se escondeu: não há mais penalidade por fuga
      const acabando = m.restante < 1;
      if (acabando !== m.acabando) { m.acabando = acabando; b.sprite.classList.toggle('acabando', acabando); }
    }

    if (partida.tempoNivel <= 0) { partida.tempoNivel = 0; encerrarNivel(); return; }

    partida.contagemSpawn -= dt;
    if (partida.contagemSpawn <= 0) {
      tentarSpawn();
      partida.contagemSpawn = B.intervaloDeSpawn(DIFICULDADE, partida.nivel, TOTAL);
    }

    el.progresso.value = ((DURACAO - partida.tempoNivel) / DURACAO) * 100;
    if (Math.ceil(partida.tempoNivel) !== partida.ultimoTempoMostrado) atualizarHUD();
  }

  function sumir(m) {
    m.buraco.toupeira = null;
    esconder(m.buraco);
  }

  const percentualNivel = () =>
    partida.exibidasNivel > 0 ? (partida.acertosNivel / partida.exibidasNivel) * 100 : 0;

  function encerrarNivel() { //fim dos t segundos: passa se atingiu x% das exibidas
    if (percentualNivel() >= PERCENTUAL_META) subirDeNivel();
    else fimDeJogo('nivel');
  }

  function subirDeNivel() {
    partida.nivel++;
    partida.tempoNivel = DURACAO;
    partida.exibidasNivel = 0;
    partida.acertosNivel = 0;
    partida.bloqueio = PAUSA_ENTRE_NIVEIS;
    partida.contagemSpawn = 0.5;
    limparTabuleiro();
    mostrarFaixa('NÍVEL ' + partida.nivel);
    el.progresso.value = 0;
    atualizarHUD();
  }

  function atualizarHUD() {
    el.nivel.textContent = partida.nivel;
    partida.ultimoTempoMostrado = Math.ceil(Math.max(0, partida.tempoNivel));
    el.tempo.textContent = partida.ultimoTempoMostrado + 's';
    el.meta.textContent = PERCENTUAL_META + '%';
    el.score.textContent = partida.score;
    el.kills.textContent = partida.kills;
    el.pct.textContent = Math.floor(percentualNivel()) + '% (' + partida.acertosNivel + '/' + partida.exibidasNivel + ')';
  }

  function mostrarMensagem(titulo, texto, rotuloBotao, aoClicar, rotuloBotao2, aoClicar2) {
    el.msgTitulo.textContent = titulo;
    el.msgTexto.textContent = texto;
    el.msgBotao.textContent = rotuloBotao;
    el.msgBotao.onclick = aoClicar;
    if (rotuloBotao2) {
      el.msgBotao2.textContent = rotuloBotao2;
      el.msgBotao2.onclick = aoClicar2;
      el.msgBotao2.hidden = false;
    } else {
      el.msgBotao2.hidden = true;
    }
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
    el.progresso.value = 0;
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

  // grava a partida no histórico (localStorage); só uma vez por partida
  function salvarNoHistorico(motivo) {
    if (partida.salva) return;
    partida.salva = true;
    Armazenamento.salvarPartida({
      modo: MODO, dificuldade: DIFICULDADE, tamanho: N,
      nivel: partida.nivel, acertos: partida.kills, pontos: partida.score,
      tempo: Math.floor(partida.tempo), motivo,
    });
  }

  function fimDeJogo(motivo) {
    if (partida.situacao === 'fim') return;
    const pctFinal = Math.floor(percentualNivel());
    partida.situacao = 'fim';
    cancelAnimationFrame(rafId);
    limparTabuleiro();
    salvarNoHistorico(motivo);

    const acuracia = partida.cliques ? Math.round((partida.acertos / partida.cliques) * 100) : 0;
    let resumo = 'Nível ' + partida.nivel + '  •  Acertos ' + partida.kills + '  •  Pontos ' + partida.score +
                 '  •  Acurácia ' + acuracia + '%';
    if (motivo === 'nivel') {
      resumo = 'Você acertou ' + pctFinal + '% das toupeiras do nível (mínimo ' + PERCENTUAL_META + '%).  ' + resumo;
    }
    mostrarMensagem(
      motivo === 'desistencia' ? 'SEPPUKU' : 'FIM DE JOGO', resumo,
      'Jogar de novo', iniciar,
      'Voltar às configurações', () => { window.location.href = 'configuracoes.html'; }
    );

    document.dispatchEvent(new CustomEvent('jogo:fim', {
      detail: {
        motivo, modo: MODO, dificuldade: DIFICULDADE, tamanho: N,
        nivel: partida.nivel, pontos: partida.score, acertos: partida.kills,
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

  // sair da página no meio da partida conta como desistência e fica no histórico
  window.addEventListener('pagehide', () => {
    if (partida.situacao === 'jogando' || partida.situacao === 'pausado') salvarNoHistorico('desistencia');
  });

  TIPOS.forEach((t) => { new Image().src = t.img; });
  construirTabuleiro();
  novaPartida();
  atualizarHUD();
  mostrarMensagem(
    'PRONTO?',
    N + 'x' + N + '  •  ' + { facil: 'Fácil', normal: 'Normal', dificil: 'Difícil' }[DIFICULDADE] +
      '  •  ' + DURACAO + 's por nível  •  Meta ' + PERCENTUAL_META + '%  •  Esc ou P pausa',
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
