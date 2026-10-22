// Armazenamento local (localStorage). Sem back-end, sem banco de dados.
const Armazenamento = (() => {
  const CH_USUARIOS = 'wams.usuarios';
  const CH_SESSAO = 'wams.sessao';
  const CH_HISTORICO = 'wams.historico';

  const ler = (chave, padrao) => {
    try {
      const v = JSON.parse(localStorage.getItem(chave));
      return v === null || v === undefined ? padrao : v;
    } catch (e) {
      return padrao;
    }
  };
  const gravar = (chave, valor) => {
    try {
      localStorage.setItem(chave, JSON.stringify(valor));
      return true;
    } catch (e) {
      return false;
    }
  };

  const soDigitos = (s) => String(s || '').replace(/\D/g, '');
  const mesmoUser = (a, b) => String(a).trim().toLowerCase() === String(b).trim().toLowerCase();

  // ---------- validação (cadastro e edição) ----------
  function validar(d, edicao) {
    const nome = String(d.nome || '').trim();
    if (nome.split(/\s+/).filter(Boolean).length < 2) return 'Informe o nome completo.';

    if (!edicao) {
      if (!d.nascimento) return 'Informe a data de nascimento.';
      const nasc = new Date(d.nascimento + 'T00:00:00');
      if (isNaN(nasc) || nasc > new Date() || nasc.getFullYear() < 1900) return 'Data de nascimento inválida.';
      if (soDigitos(d.cpf).length !== 11) return 'O CPF deve ter 11 dígitos.';
      if (!/^[A-Za-z0-9_]{3,20}$/.test(String(d.username || '').trim()))
        return 'Username: de 3 a 20 caracteres (letras, números ou _).';
    }

    const tel = soDigitos(d.telefone);
    if (tel.length < 10 || tel.length > 11) return 'Telefone inválido (DDD + número).';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(d.email || '').trim())) return 'E-mail inválido.';

    const senha = String(d.senha || '');
    if (!(edicao && senha === '') && senha.length < 4) return 'A senha deve ter ao menos 4 caracteres.';
    return null;
  }

  // ---------- usuários e sessão ----------
  function cadastrar(d) {
    const erro = validar(d, false);
    if (erro) return { ok: false, erro };

    const usuarios = ler(CH_USUARIOS, []);
    if (usuarios.some((u) => mesmoUser(u.username, d.username))) return { ok: false, erro: 'Esse username já está em uso.' };
    if (usuarios.some((u) => u.cpf === soDigitos(d.cpf))) return { ok: false, erro: 'Já existe um cadastro com esse CPF.' };

    usuarios.push({
      nome: String(d.nome).trim(),
      nascimento: d.nascimento,
      cpf: soDigitos(d.cpf),
      telefone: String(d.telefone).trim(),
      email: String(d.email).trim(),
      username: String(d.username).trim(),
      senha: String(d.senha),
    });
    return gravar(CH_USUARIOS, usuarios)
      ? { ok: true }
      : { ok: false, erro: 'Não foi possível salvar (armazenamento do navegador indisponível).' };
  }

  function login(username, senha) {
    const u = ler(CH_USUARIOS, []).find((x) => mesmoUser(x.username, username));
    if (!u || u.senha !== senha) return { ok: false, erro: 'Usuário ou senha incorretos.' };
    gravar(CH_SESSAO, u.username);
    return { ok: true };
  }

  function logout() {
    try { localStorage.removeItem(CH_SESSAO); } catch (e) { /* ignora */ }
  }

  function usuarioLogado() {
    const nome = ler(CH_SESSAO, null);
    if (!nome) return null;
    const u = ler(CH_USUARIOS, []).find((x) => mesmoUser(x.username, nome));
    if (!u) { logout(); return null; }
    return u;
  }

  // chame no <head> das páginas que exigem login
  function exigirLogin() {
    if (!usuarioLogado()) window.location.replace('inicial.html');
  }

  // CPF, data de nascimento e username não mudam. Senha em branco = mantém a atual.
  function atualizarUsuario(d) {
    const atual = usuarioLogado();
    if (!atual) return { ok: false, erro: 'Sessão expirada. Faça login novamente.' };
    const erro = validar(d, true);
    if (erro) return { ok: false, erro };

    const usuarios = ler(CH_USUARIOS, []);
    const i = usuarios.findIndex((u) => mesmoUser(u.username, atual.username));
    if (i < 0) return { ok: false, erro: 'Usuário não encontrado.' };

    usuarios[i].nome = String(d.nome).trim();
    usuarios[i].telefone = String(d.telefone).trim();
    usuarios[i].email = String(d.email).trim();
    if (String(d.senha || '') !== '') usuarios[i].senha = String(d.senha);
    return gravar(CH_USUARIOS, usuarios) ? { ok: true } : { ok: false, erro: 'Não foi possível salvar.' };
  }

  // ---------- histórico e ranking ----------
  function salvarPartida(p) {
    const u = usuarioLogado();
    if (!u) return false;
    const historico = ler(CH_HISTORICO, []);
    historico.push({ ...p, usuario: u.username, nome: u.nome, data: new Date().toISOString() });
    return gravar(CH_HISTORICO, historico);
  }

  function historicoDoUsuario() {
    const u = usuarioLogado();
    if (!u) return [];
    return ler(CH_HISTORICO, [])
      .filter((p) => mesmoUser(p.usuario, u.username))
      .sort((a, b) => new Date(b.data) - new Date(a.data));
  }

  const melhorQue = (a, b) => (a.nivel !== b.nivel ? a.nivel > b.nivel : a.pontos > b.pontos);

  // melhor partida de cada jogador (maior nível; desempate por pontos)
  function ranking(limite = 10) {
    const melhores = new Map();
    for (const p of ler(CH_HISTORICO, [])) {
      const atual = melhores.get(p.usuario);
      if (!atual || melhorQue(p, atual)) melhores.set(p.usuario, p);
    }
    return [...melhores.values()].sort((a, b) => (melhorQue(a, b) ? -1 : melhorQue(b, a) ? 1 : 0)).slice(0, limite);
  }

  // ---------- formatação ----------
  const ROTULO_DIF = { facil: 'Fácil', normal: 'Normal', dificil: 'Difícil' };
  const rotuloModo = (p) => (p.modo === 'bombastico' ? 'Bombástico' : 'Clássico') + ' (' + (ROTULO_DIF[p.dificuldade] || '-') + ')';
  const formatarData = (iso) => new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

  return {
    cadastrar, login, logout, usuarioLogado, exigirLogin, atualizarUsuario,
    salvarPartida, historicoDoUsuario, ranking,
    rotuloModo, formatarData,
  };
})();
