document.querySelectorAll('button[data-acao]').forEach((b) => {
    b.addEventListener('click', async () => {
        b.disabled = true;
        const r = await Armazenamento.skinAcao(b.dataset.skin, b.dataset.acao);
        if (r.ok) { window.location.reload(); return; }
        document.getElementById('mensagem-skins').textContent = r.erro;
        b.disabled = false;
    });
});