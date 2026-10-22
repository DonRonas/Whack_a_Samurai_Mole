const Toupeiras = (() => {
  const ARQUEIRA_REDUCAO = 0.5;

  const TIPOS = [
    {
      numero: 1, id: 'camponesa', nome: 'Toupeira Camponesa', //nao faz nada
      img: '../img/toupeira_camponesa.png',
      ajusteTempo: 0,
      vida: 1,
      pontos: 10,
      habilidade: null,
    },
    {
      numero: 2, id: 'arqueira', nome: 'Toupeira Arqueira', //ta no começo, tira 0.5 dos adjacentes (facil e normal e 4 direcoes, dificil e ate diagonal)
      img: '../img/toupeira_arqueira.png',
      ajusteTempo: 0,
      vida: 1,
      pontos: 15,
      habilidade: 'arqueira',
    },
    {
      numero: 3, id: 'ninja', nome: 'Toupeira Ninja', //so 0.5 mais rapida
      img: '../img/toupeira_ninja.png',
      ajusteTempo: -0.5,
      vida: 1,
      pontos: 20,
      habilidade: null,
    },
    {
      numero: 4, id: 'demonio', nome: 'Toupeira Demônio', //"buffa" o monge e espanta outras toupeiras (facil e normal e 4 direcoes, dificil e ate diagonal)
      img: '../img/toupeira_demonio.png',
      ajusteTempo: 0,
      vida: 1,
      pontos: 25,
      habilidade: 'demonio',
    },
    {
      numero: 5, id: 'monge', nome: 'Toupeira Monge', //mais rapida e aparece mais por demonio
      img: '../img/toupeira_monge.png',
      ajusteTempo: -0.5,
      vida: 1,
      pontos: 30,
      habilidade: null,
    },
    {
      numero: 6, id: 'samurai', nome: 'Toupeira Samurai', //tem dois de vida
      img: '../img/topeira_samurai.png',
      ajusteTempo: 0,
      vida: 2,
      pontos: 35,
      habilidade: null,
    },
    {
      numero: 7, id: 'bomba', nome: 'Bomba', //a bomba kkk
      img: '../img/bomba.png',
      ajusteTempo: -1,
      vida: 1,
      pontos: 0,
      habilidade: null,
    }
  ];

  const POR_ID = Object.fromEntries(TIPOS.map((t) => [t.id, t]));

  return { TIPOS, POR_ID, ARQUEIRA_REDUCAO };
})();

if (typeof module !== 'undefined') module.exports = Toupeiras;
