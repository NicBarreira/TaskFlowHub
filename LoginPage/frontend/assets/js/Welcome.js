document.addEventListener("DOMContentLoaded", () => {
    const toggleRegister = document.getElementById("toggleRegister");
    const toggleLogin = document.getElementById("toggleLogin");
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");
    const forgotPasswordForm = document.getElementById("forgotPasswordForm");
    const linkForgotPassword = document.getElementById("linkForgotPassword");
    const linkBackToLogin = document.getElementById("linkBackToLogin");
    const mensagemFeedback = document.getElementById("mensagemFeeback");

    // Mantido nome consistente com o fetch
    const API_URL = "http://localhost:3000/api";

    function exibirMensagem(texto, tipo = "sucesso") {
        if (!mensagemFeedback) return;
        mensagemFeedback.textContent = texto;
        mensagemFeedback.style.color = tipo === "sucesso" ? "#2e7d32" : "#d32f2f";
        mensagemFeedback.style.marginTop = "1rem";
        mensagemFeedback.style.fontWeight = "bold";
        mensagemFeedback.style.textAlign = "center";
    }

    function limparmensagem() {
        if (mensagemFeedback) mensagemFeedback.textContent = "";
    }

    function showForm(formToShow) {
        registerForm.style.display = "none";
        loginForm.style.display = "none";
        forgotPasswordForm.style.display = "none";
        
        formToShow.style.display = "block";
        limparmensagem();
    }

    // Alternar para Registrar
    toggleRegister.addEventListener("click", () => {
        toggleRegister.classList.add("active");
        toggleLogin.classList.remove("active");
        showForm(registerForm);
    });

    // Alternar para Entrar
    toggleLogin.addEventListener("click", () => {
        toggleLogin.classList.add("active");
        toggleRegister.classList.remove("active");
        showForm(loginForm);
    });

    // Abrir Esqueci a Senha
    linkForgotPassword.addEventListener("click", (e) => {
        e.preventDefault();
        toggleRegister.classList.remove("active");
        toggleLogin.classList.remove("active");
        showForm(forgotPasswordForm);
    });

    // Voltar para Login a partir de Esqueci a Senha
    linkBackToLogin.addEventListener("click", (e) => {
        e.preventDefault();
        toggleLogin.classList.add("active");
        showForm(loginForm);
    });

    // Background Interativo (apenas uma declaração)
    window.addEventListener("mousemove", (e) => {
        const xPercent = (e.clientX / window.innerWidth) * 100;
        const yPercent = (e.clientY / window.innerHeight) * 100;

        document.body.style.setProperty("--mouse-x", `${xPercent}%`);
        document.body.style.setProperty("--mouse-y", `${yPercent}%`);
    });

    // SUBMIT DO REGISTRO
    registerForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        limparmensagem();

        // Correção: .value.trim() sem parênteses
        const fullName = document.getElementById("fullName").value.trim();
        const username = document.getElementById("regUsername").value.trim();
        const email = document.getElementById("regEmail").value.trim();
        const password = document.getElementById("regPassword").value;
        const passwordConfirm = document.getElementById("regPasswordConfirm").value;
        const locale = document.getElementById("regLocale").value;

        const btnSubmit = registerForm.querySelector("button[type='submit']");

        if (password !== passwordConfirm) {
            exibirMensagem("As senhas não coincidem.", "erro");
            return;
        }

        try {
            if (btnSubmit) btnSubmit.disabled = true;

            const response = await fetch(`${API_URL}/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fullName, username, email, password, locale }),
            }); 

            const data = await response.json();

            if (response.ok) {
                exibirMensagem(data.message || "Registro criado com sucesso!", "sucesso");   
                registerForm.reset();
                setTimeout(() => toggleLogin.click(), 2000);       
            } else {
                exibirMensagem(data.error || "Erro ao registrar conta", "erro");
            }
        } catch (err) {
            console.error('Erro na requisição:', err);
            exibirMensagem('Não foi possível conectar ao servidor. Verifique se o Node.js está rodando.', 'erro');
        } finally {
            if (btnSubmit) btnSubmit.disabled = false;
        }
    });
});