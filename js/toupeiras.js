const Toupeiras = (() => {
  const ARQUEIRA_REDUCAO = 0.5;

  const TIPOS = [
    {
      numero: 1, id: 'camponesa', nome: 'Toupeira Camponesa',
      img: '../img/toupeira_camponesa.png',
      ajusteTempo: 0,
      vida: 1,
      pontos: 0,
      habilidade: null,
    },
    {
      numero: 2, id: 'arqueira', nome: 'Toupeira Arqueira',
      img: '../img/toupeira_arqueira.png',
      ajusteTempo: 0,
      vida: 1,
      pontos: 0,
      habilidade: 'arqueira',
    },
    {
      numero: 3, id: 'ninja', nome: 'Toupeira Ninja',
      img: '../img/toupeira_ninja.png',
      ajusteTempo: -0.5,
      vida: 1,
      pontos: 0,
      habilidade: null,
    },
    {
      numero: 4, id: 'demonio', nome: 'Toupeira Demônio',
      img: '../img/toupeira_demonio.png',
      ajusteTempo: 0,
      vida: 1,
      pontos: 0,
      habilidade: 'demonio',
    },
    {
      numero: 5, id: 'monge', nome: 'Toupeira Monge',
      img: '../img/toupeira_monge.png',
      ajusteTempo: -0.5,
      vida: 1,
      pontos: 0,
      habilidade: null,
    },
    {
      numero: 6, id: 'samurai', nome: 'Toupeira Samurai',
      img: '../img/topeira_samurai.png',
      ajusteTempo: 0,
      vida: 2,
      pontos: 0,
      habilidade: null,
    },
  ];

  const POR_ID = Object.fromEntries(TIPOS.map((t) => [t.id, t]));

  return { TIPOS, POR_ID, ARQUEIRA_REDUCAO };
})();

if (typeof module !== 'undefined') module.exports = Toupeiras;
