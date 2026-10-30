// main.js – Front‑end logic for authentication page

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('authForm');
    const forgotLink = document.getElementById('forgotPasswordLink');

    // Simple validation helper
    const isValidEmail = email => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email);

    form.addEventListener('submit', e => {
        e.preventDefault();
        // Gather values
        const realName = form.realName.value.trim();
        const username = form.username.value.trim();
        const email = form.email.value.trim();
        const password = form.password.value;
        const locale = form.locale.value;

        // Basic validation
        const errors = [];
        if (!realName) errors.push('Nome Real é obrigatório');
        if (!username) errors.push('Nome de Usuário é obrigatório');
        if (!email || !isValidEmail(email)) errors.push('E‑mail inválido');
        if (!password || password.length < 6) errors.push('Senha deve ter ao menos 6 caracteres');
        if (!locale) errors.push('Selecione a língua');

        if (errors.length) {
            alert(errors.join('\n'));
            return;
        }

        // TODO: enviar ao back‑end (fetch API)
        console.log({realName, username, email, password, locale});
        alert('Formulário enviado (simulação).');
    });

    // Forgot password modal handling
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>Recuperar senha</h2>
            <p>Informe seu e‑mail para receber instruções de redefinição.</p>
            <input type="email" id="recoverEmail" placeholder="E‑mail" required />
            <button id="sendRecover">Enviar</button>
            <button id="closeModal">Fechar</button>
        </div>`;
    document.body.appendChild(modal);

    const openModal = () => { modal.style.display = 'flex'; };
    const closeModal = () => { modal.style.display = 'none'; };

    forgotLink.addEventListener('click', e => {
        e.preventDefault();
        openModal();
    });

    modal.querySelector('#closeModal').addEventListener('click', closeModal);
    modal.querySelector('#sendRecover').addEventListener('click', () => {
        const email = modal.querySelector('#recoverEmail').value.trim();
        if (!email || !isValidEmail(email)) {
            alert('Informe um e‑mail válido');
            return;
        }
        // TODO: chamada ao back‑end para iniciar recuperação
        console.log('Recuperar senha para', email);
        alert('Instruções enviadas (simulação).');
        closeModal();
    });
});
