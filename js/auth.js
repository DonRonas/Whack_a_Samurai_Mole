(() => {
  'use strict';

  const $ = (id) => document.getElementById(id);
  const valor = (id) => ($(id) ? $(id).value : '');

  function aviso(texto, sucesso) {
    const el = $('mensagem-form');
    el.textContent = texto;
    el.style.color = sucesso ? '#7CFC00' : '#ff6b6b';
  }

  const formLogin = $('form-login');
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const r = await Armazenamento.login(valor('usuario'), valor('senha'));
      if (r.ok) window.location.href = 'principal.php';
      else aviso(r.erro, false);
    });
  }

  const formCadastro = $('form-cadastro');
  if (formCadastro) {
    formCadastro.addEventListener('submit', async (e) => {
      e.preventDefault();
      const r = await Armazenamento.cadastrar({
        nome: valor('nome'), nascimento: valor('nascimento'), cpf: valor('cpf'),
        telefone: valor('telefone'), email: valor('email'),
        username: valor('username'), senha: valor('senha'),
      });
      if (!r.ok) return aviso(r.erro, false);
      aviso('Cadastro realizado! Redirecionando para o login...', true);
      setTimeout(() => (window.location.href = 'inicial.php'), 1200);
    });
  }

  const formAlteracao = $('form-alteracao');
  if (formAlteracao) {
    Armazenamento.usuario().then((r) => {
      if (!r.ok) return;
      const u = r.usuario;
      $('nome').value = u.nome;
      $('telefone').value = u.telefone;
      $('email').value = u.email;
      $('nascimento').value = u.nascimento;
      $('cpf').value = u.cpf;
      $('username').value = u.username;
    });

    formAlteracao.addEventListener('submit', async (e) => {
      e.preventDefault();
      const r = await Armazenamento.atualizarUsuario({
        nome: valor('nome'), telefone: valor('telefone'), email: valor('email'), senha: valor('senha'),
      });
      if (!r.ok) return aviso(r.erro, false);
      aviso('Cadastro atualizado!', true);
      setTimeout(() => (window.location.href = 'principal.php'), 1000);
    });
  }
})();