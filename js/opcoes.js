const Opcoes = (() => {
  const CHAVE = 'wams.opcoes';
  const DIFICULDADES = ['facil', 'normal', 'dificil'];

  const PADRAO = Object.freeze({
    tamanho: 3,
    dificuldade: 'normal',
    som: true,
    volMusica: 50,
    volEfeitos: 70,
    tremor: true,
    pausaAuto: true,
    bomba: false,
  });

  const limitar = (v, min, max, padrao) => {
    v = Number(v);
    return Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : padrao;
  };

  function sanitizar(bruto) {
    const o = { ...PADRAO, ...(bruto || {}) };
    o.tamanho = Math.round(limitar(o.tamanho, 2, 8, PADRAO.tamanho));
    if (!DIFICULDADES.includes(o.dificuldade)) o.dificuldade = PADRAO.dificuldade;
    o.bomba = !!o.bomba
    o.som = !!o.som;
    o.tremor = !!o.tremor; //esses tres em boolean
    o.pausaAuto = !!o.pausaAuto;
    o.volMusica = Math.round(limitar(o.volMusica, 0, 100, PADRAO.volMusica));
    o.volEfeitos = Math.round(limitar(o.volEfeitos, 0, 100, PADRAO.volEfeitos)); //configurar o slider do som
    return o;
  }

  function carregar() { //converte para objeto js
    try {
      return sanitizar(JSON.parse(localStorage.getItem(CHAVE)));
    } catch (e) {
      return sanitizar(null);
    }
  }

  function salvar(opcoes) {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(sanitizar(opcoes))); //coloca em json o que foi mudado depois do sanitizar
      return true;
    } catch (e) {
      return false;
    }
  }

  return { PADRAO, DIFICULDADES, carregar, salvar, sanitizar };
})();
