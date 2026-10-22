(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  let opcoes = Opcoes.carregar();
  let avisoTimer = 0;

  function mostrarAviso(texto) {
    const aviso = $('aviso');
    aviso.textContent = texto;
    aviso.classList.add('visivel');
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(() => aviso.classList.remove('visivel'), 1500);
  }

  function desenharPrevia() { //mini tabuleiro no configuracoes
    const n = opcoes.tamanho;
    const previa = $('previaTabuleiro');
    previa.style.gridTemplateColumns = 'repeat(' + n + ', 1fr)';
    previa.style.gridTemplateRows = 'repeat(' + n + ', 1fr)';
    previa.textContent = '';
    for (let i = 0; i < n * n; i++) previa.appendChild(document.createElement('span'));
    $('previaTexto').textContent = n + 'x' + n + ' — ' + n * n + ' buracos';
  }

  function aplicarNaTela() { //igualar o que esta marcado com a aparencia no menu
    document.querySelectorAll('input[name="tamanho"]').forEach((r) => (r.checked = Number(r.value) === opcoes.tamanho));
    document.querySelectorAll('input[name="dificuldade"]').forEach((r) => (r.checked = r.value === opcoes.dificuldade));

    $('som').checked = opcoes.som;
    $('tremor').checked = opcoes.tremor;
    $('pausaAuto').checked = opcoes.pausaAuto;

    $('volMusica').value = opcoes.volMusica;
    $('volMusicaValor').textContent = opcoes.volMusica + '%';
    $('volEfeitos').value = opcoes.volEfeitos;
    $('volEfeitosValor').textContent = opcoes.volEfeitos + '%';
    $('volMusica').disabled = $('volEfeitos').disabled = !opcoes.som;

    desenharPrevia();
  }

  function mudou(parcial) { //manda pro opcoes para guardar etc
    opcoes = Opcoes.sanitizar({ ...opcoes, ...parcial });
    Opcoes.salvar(opcoes);
    aplicarNaTela();
    mostrarAviso('Configurações salvas!');
  }

  document.querySelectorAll('input[name="tamanho"]').forEach((r) =>
    r.addEventListener('change', () => mudou({ tamanho: Number(r.value) })));
  document.querySelectorAll('input[name="dificuldade"]').forEach((r) =>
    r.addEventListener('change', () => mudou({ dificuldade: r.value })));

  $('som').addEventListener('change', (e) => mudou({ som: e.target.checked }));
  $('tremor').addEventListener('change', (e) => mudou({ tremor: e.target.checked }));
  $('pausaAuto').addEventListener('change', (e) => mudou({ pausaAuto: e.target.checked }));
  $('volMusica').addEventListener('input', (e) => mudou({ volMusica: e.target.value }));
  $('volEfeitos').addEventListener('input', (e) => mudou({ volEfeitos: e.target.value }));
  $('restaurar').addEventListener('click', () => mudou({ ...Opcoes.PADRAO }));

  aplicarNaTela();
  requestAnimationFrame(() => requestAnimationFrame(() => document.body.classList.remove('carregando')));
})();
