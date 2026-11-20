const Armazenamento = (() => {
  const PAGINA_LOGIN = 'inicial.php';

  async function chamar(url, corpo) {
    const opcoes = { credentials: 'same-origin' };
    if (corpo !== undefined) {
      opcoes.method = 'POST';
      opcoes.headers = { 'Content-Type': 'application/json' };
      opcoes.body = JSON.stringify(corpo);
      opcoes.keepalive = true; // o envio termina mesmo se a aba for fechada
    }
    try {
      const resp = await fetch(url, opcoes);
      const dados = await resp.json();
      if (resp.status === 401 && dados.sessao_expirada) {
        window.location.replace(PAGINA_LOGIN);
      }
      return dados;
    } catch (e) {
      return { ok: false, erro: 'Não foi possível falar com o servidor.' };
    }
  }

  const login = (username, senha) => chamar('../api/login.php', { username, senha });
  const cadastrar = (dados) => chamar('../api/cadastro.php', dados);
  const usuario = () => chamar('../api/usuario.php');
  const atualizarUsuario = (dados) => chamar('../api/usuario_atualizar.php', dados);
  const salvarPartida = (partida) => chamar('../api/partida_salvar.php', partida);
  const historico = () => chamar('../api/historico.php');
  const ranking = () => chamar('../api/ranking.php');
  const skinAcao = (skin, acao) => chamar('../api/skin_acao.php', { skin, acao });

  async function logout() {
    await chamar('../api/logout.php', {});
    window.location.replace(PAGINA_LOGIN);
  }

  const ROTULO_DIF = { facil: 'Fácil', normal: 'Normal', dificil: 'Difícil' };
  const rotuloModo = (p) => (p.modo === 'bombastico' ? 'Bombástico' : 'Clássico') + ' (' + (ROTULO_DIF[p.dificuldade] || '-') + ')';
  const formatarData = (iso) => new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

  return {
    login, cadastrar, usuario, atualizarUsuario, logout,
    salvarPartida, historico, ranking, skinAcao,
    rotuloModo, formatarData,
  };
})();