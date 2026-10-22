const Balanceamento = (() => {
  const arredondar = (v) => Math.round(v * 100) / 100;

  const TEMPO_PERMANENCIA = {
    facil:   { inicial: 5, minimo: 4 },
    normal:  { inicial: 4, minimo: 3 },
    dificil: { inicial: 3, minimo: 1.5 },
  };
  const REDUCAO_TEMPO_POR_NIVEL = 0.1;
  const TEMPO_MINIMO_ABSOLUTO = 0.5;

  function tempoDePermanencia(dificuldade, nivel) {
    const c = TEMPO_PERMANENCIA[dificuldade];
    const t = c.inicial - REDUCAO_TEMPO_POR_NIVEL * (nivel - 1);
    return arredondar(Math.max(c.minimo, t));
  }

  const INTERVALO_SPAWN = {
    facil:   { inicial: 1.8, minimo: 0.9 },
    normal:  { inicial: 1.4, minimo: 0.7 },
    dificil: { inicial: 1.0, minimo: 0.55 },
  };
  const REDUCAO_INTERVALO_POR_NIVEL = 0.05;
  const INTERVALO_MINIMO_ABSOLUTO = 0.25;

  function intervaloDeSpawn(dificuldade, nivel, qtdBuracos) {
    const c = INTERVALO_SPAWN[dificuldade];
    const base = Math.max(c.minimo, c.inicial - REDUCAO_INTERVALO_POR_NIVEL * (nivel - 1));
    const fatorGrade = Math.sqrt(qtdBuracos / 9);
    return arredondar(Math.max(INTERVALO_MINIMO_ABSOLUTO, base / fatorGrade));
  }

//chances de spawn das toupeiras por nível e dificuldade
  const CHANCES = {
    facil: {
      arqueira: { base: 12, porNivel: 0.5 },
      ninja:    { base: 8,  porNivel: 0.5 },
      demonio:  { base: 4,  porNivel: 0.3 },
      monge:    { base: 4,  porNivel: 0.3 },
      samurai:  { base: 4,  porNivel: 0.3 },
    },
    normal: {
      arqueira: { base: 15, porNivel: 0.8 },
      ninja:    { base: 12, porNivel: 0.8 },
      demonio:  { base: 7,  porNivel: 0.5 },
      monge:    { base: 7,  porNivel: 0.5 },
      samurai:  { base: 7,  porNivel: 0.5 },
    },
    dificil: {
      arqueira: { base: 18, porNivel: 1.0 },
      ninja:    { base: 15, porNivel: 1.0 },
      demonio:  { base: 10, porNivel: 0.7 },
      monge:    { base: 10, porNivel: 0.7 },
      samurai:  { base: 10, porNivel: 0.7 },
    },
  };
  const CHANCE_MAXIMA = { arqueira: 25, ninja: 25, demonio: 18, monge: 18, samurai: 18 };
  const CAMPONESA_MINIMA = 10;

  const ORDEM_SORTEIO = ['arqueira', 'ninja', 'demonio', 'monge', 'samurai'];

  const AZAR = {
    aposSpawns: 8,
    bonusPorSpawn: 2,
    bonusMaximo: 20,
  };

  const BONUS_MONGE_POR_DEMONIO = 0.15;

  function calcularChances(dificuldade, nivel, semAparecer = {}, demonios = 0) {
    const tabela = CHANCES[dificuldade];
    const lista = ORDEM_SORTEIO.map((id) => {
      let chance = Math.min(CHANCE_MAXIMA[id], tabela[id].base + tabela[id].porNivel * (nivel - 1));

      const espera = Math.max(0, (semAparecer[id] || 0) - AZAR.aposSpawns);
      chance += Math.min(AZAR.bonusMaximo, espera * AZAR.bonusPorSpawn);

      if (id === 'monge') chance *= 1 + BONUS_MONGE_POR_DEMONIO * demonios;
      return { id, chance };
    });

    const limite = 100 - CAMPONESA_MINIMA;
    const soma = lista.reduce((s, x) => s + x.chance, 0);
    if (soma > limite) lista.forEach((x) => (x.chance = (x.chance * limite) / soma));

    lista.push({ id: 'camponesa', chance: 100 - lista.reduce((s, x) => s + x.chance, 0) });
    return lista;
  }

//funcionamento do spawn
  function sortearTipo(chances, rolagem) {
    let acumulado = 0;
    for (const { id, chance } of chances) {
      acumulado += chance;
      if (rolagem < acumulado) return id;
    }
    return chances[chances.length - 1].id;
  }

  //kills pra passar de fase
  function metaDeKills(nivel) {
    return Math.min(40, 8 + 2 * (nivel - 1));
  }
  //toupeiras que podem fugir antes de perder
  function limiteDeFugas(qtdBuracos) {
    return Math.round(5 + qtdBuracos / 3);
  }

  return {
    TEMPO_MINIMO_ABSOLUTO,
    tempoDePermanencia, intervaloDeSpawn,
    calcularChances, sortearTipo,
    metaDeKills, limiteDeFugas,
  };
})();

if (typeof module !== 'undefined') module.exports = Balanceamento;
