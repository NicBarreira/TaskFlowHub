/**
 * Módulo de Autenticação
 * Gerencia a máquina de estados entre Login, Registro, Esqueci a Senha,
 * Inserir Código de Verificação e Redefinir Senha, além de validações e consumo da API.
 */
const API_BASE_URL = 'http://localhost:3000/api';

function initAuth() {
  // Controles de Abas e Seções Principais
  const tabsContainer = document.getElementById('tabs-container');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');

  const stateLogin = document.getElementById('state-login');
  const stateRegister = document.getElementById('state-register');
  const stateForgot = document.getElementById('state-forgot');
  const stateVerifyCode = document.getElementById('state-verify-code');
  const stateResetPassword = document.getElementById('state-reset-password');

  // Botões de Navegação entre Telas
  const btnGotoForgot = document.getElementById('btn-goto-forgot');
  const btnBackToLogin = document.getElementById('btn-back-to-login');
  const btnVerifyBackToLogin = document.getElementById('btn-verify-back-to-login');
  const btnVerifyChangeEmail = document.getElementById('btn-verify-change-email');
  const btnResetBackToLogin = document.getElementById('btn-reset-back-to-login');

  // Elementos da Tela de Esqueci a Senha
  const forgotForm = document.getElementById('form-forgot');
  const forgotEmail = document.getElementById('forgot-email');
  const btnForgotSubmit = document.getElementById('btn-forgot-submit');
  const btnForgotText = document.getElementById('btn-forgot-text');

  // Elementos da Tela de Verificação de Código
  const verifyForm = document.getElementById('form-verify-code');
  const verifyEmailDisplay = document.getElementById('verify-email-display');
  const otpInputs = Array.from(document.querySelectorAll('.otp-input'));
  const btnVerifySubmit = document.getElementById('btn-verify-submit');
  const btnVerifyText = document.getElementById('btn-verify-text');
  const btnResendCode = document.getElementById('btn-resend-code');
  const resendCountdown = document.getElementById('resend-countdown');

  // Elementos da Tela de Redefinir Senha
  const resetForm = document.getElementById('form-reset-password');
  const resetNewPassword = document.getElementById('reset-new-password');
  const resetConfirmPassword = document.getElementById('reset-confirm-password');
  const btnResetSubmit = document.getElementById('btn-reset-submit');
  const btnResetText = document.getElementById('btn-reset-text');

  // Estado interno da recuperação
  let currentRecoveryEmail = '';
  let currentVerifiedCode = '';
  let resendTimerInterval = null;

  if (!tabsContainer || !tabLogin || !tabRegister) return;

  const activeTabClasses = ['bg-zinc-800', 'text-zinc-100', 'shadow-sm', 'border', 'border-zinc-700/40'];
  const inactiveTabClasses = ['text-zinc-400', 'hover:text-zinc-200'];

  /**
   * Helper para exibir ou limpar alertas visuais inline
   */
  function setFeedback(elementId, message = '', type = 'error') {
    const box = document.getElementById(elementId);
    if (!box) return;

    if (!message) {
      box.textContent = '';
      box.classList.add('hidden');
      return;
    }

    box.textContent = message;
    box.className = `p-3 rounded-xl text-xs font-medium transition-all ${
      type === 'error'
        ? 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
        : 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300'
    }`;
    box.classList.remove('hidden');
  }

  /**
   * Atualiza as classes visuais e atributos ARIA das abas
   */
  function updateTabs(activeTab, inactiveTab) {
    activeTab.classList.remove(...inactiveTabClasses);
    activeTab.classList.add(...activeTabClasses);
    activeTab.setAttribute('aria-selected', 'true');

    inactiveTab.classList.remove(...activeTabClasses);
    inactiveTab.classList.add(...inactiveTabClasses);
    inactiveTab.setAttribute('aria-selected', 'false');
  }

  /**
   * Altera a visibilidade das telas conforme o estado solicitado
   * @param {'login' | 'register' | 'forgot' | 'verify-code' | 'reset-password'} state 
   */
  function switchState(state) {
    const allStates = [stateLogin, stateRegister, stateForgot, stateVerifyCode, stateResetPassword];
    allStates.forEach((el) => {
      if (el) {
        el.classList.add('hidden');
        el.classList.remove('flex');
      }
    });

    // Limpa alertas ao alternar de tela
    ['forgot-feedback', 'verify-feedback', 'reset-feedback'].forEach((id) => setFeedback(id, ''));

    switch (state) {
      case 'login':
        tabsContainer.classList.remove('hidden');
        updateTabs(tabLogin, tabRegister);
        stateLogin?.classList.remove('hidden');
        stateLogin?.classList.add('flex');
        document.getElementById('login-email')?.focus();
        break;

      case 'register':
        tabsContainer.classList.remove('hidden');
        updateTabs(tabRegister, tabLogin);
        stateRegister?.classList.remove('hidden');
        stateRegister?.classList.add('flex');
        document.getElementById('register-name')?.focus();
        break;

      case 'forgot':
        tabsContainer.classList.add('hidden');
        stateForgot?.classList.remove('hidden');
        stateForgot?.classList.add('flex');
        if (currentRecoveryEmail && forgotEmail) {
          forgotEmail.value = currentRecoveryEmail;
        }
        forgotEmail?.focus();
        break;

      case 'verify-code':
        tabsContainer.classList.add('hidden');
        stateVerifyCode?.classList.remove('hidden');
        stateVerifyCode?.classList.add('flex');
        if (verifyEmailDisplay) {
          verifyEmailDisplay.textContent = currentRecoveryEmail || 'seu e-mail';
        }
        clearOtpInputs();
        setTimeout(() => otpInputs[0]?.focus(), 50);
        break;

      case 'reset-password':
        tabsContainer.classList.add('hidden');
        stateResetPassword?.classList.remove('hidden');
        stateResetPassword?.classList.add('flex');
        setTimeout(() => resetNewPassword?.focus(), 50);
        break;
    }
  }

  /**
   * Gerenciamento de inputs OTP (6 dígitos)
   */
  function clearOtpInputs() {
    otpInputs.forEach((input) => (input.value = ''));
  }

  function getOtpValue() {
    return otpInputs.map((input) => input.value.trim()).join('');
  }

  function setupOtpHandlers() {
    if (otpInputs.length === 0) return;

    otpInputs.forEach((input, index) => {
      // Aceita apenas números e avança automaticamente
      input.addEventListener('input', (event) => {
        const raw = event.target.value.replace(/\D/g, '');
        event.target.value = raw ? raw[raw.length - 1] : '';

        setFeedback('verify-feedback', '');

        if (event.target.value && index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
          otpInputs[index + 1].select();
        }

        // Se completou os 6 dígitos, foca no botão ou submete
        if (getOtpValue().length === otpInputs.length) {
          btnVerifySubmit?.focus();
        }
      });

      // Navegação com Backspace e setas
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Backspace') {
          if (!input.value && index > 0) {
            otpInputs[index - 1].focus();
            otpInputs[index - 1].value = '';
            event.preventDefault();
          }
        } else if (event.key === 'ArrowLeft' && index > 0) {
          otpInputs[index - 1].focus();
          event.preventDefault();
        } else if (event.key === 'ArrowRight' && index < otpInputs.length - 1) {
          otpInputs[index + 1].focus();
          event.preventDefault();
        }
      });

      // Suporte para colar código completo (ex: "123456")
      input.addEventListener('paste', (event) => {
        event.preventDefault();
        const pastedText = (event.clipboardData || window.clipboardData).getData('text');
        const digits = pastedText.replace(/\D/g, '').slice(0, otpInputs.length);

        if (!digits) return;

        digits.split('').forEach((char, i) => {
          if (otpInputs[i]) {
            otpInputs[i].value = char;
          }
        });

        const nextIndex = Math.min(digits.length, otpInputs.length - 1);
        otpInputs[nextIndex]?.focus();

        if (digits.length === otpInputs.length) {
          btnVerifySubmit?.focus();
        }
      });

      input.addEventListener('focus', () => {
        input.select();
      });
    });
  }

  /**
   * Temporizador para reenvio de código (cooldown de 60s)
   */
  function startResendCooldown(seconds = 60) {
    if (!btnResendCode || !resendCountdown) return;

    clearInterval(resendTimerInterval);
    btnResendCode.disabled = true;

    let remaining = seconds;
    btnResendCode.innerHTML = `Reenviar em (<span id="resend-countdown">${remaining}</span>s)`;

    resendTimerInterval = setInterval(() => {
      remaining -= 1;
      const span = document.getElementById('resend-countdown');
      if (span) span.textContent = remaining;

      if (remaining <= 0) {
        clearInterval(resendTimerInterval);
        btnResendCode.disabled = false;
        btnResendCode.textContent = 'Reenviar código';
      }
    }, 1000);
  }

  // Ouvintes de navegação
  tabLogin.addEventListener('click', () => switchState('login'));
  tabRegister.addEventListener('click', () => switchState('register'));
  btnGotoForgot?.addEventListener('click', () => switchState('forgot'));
  btnBackToLogin?.addEventListener('click', () => switchState('login'));
  btnVerifyBackToLogin?.addEventListener('click', () => switchState('login'));
  btnVerifyChangeEmail?.addEventListener('click', () => switchState('forgot'));
  btnResetBackToLogin?.addEventListener('click', () => switchState('login'));

  // Inicializa manipuladores do OTP
  setupOtpHandlers();

  // ----------------------------------------------------
  // FORMULÁRIO DE LOGIN
  // ----------------------------------------------------
  const loginForm = document.getElementById('form-login');
  const loginEmail = document.getElementById('login-email');
  const loginPassword = document.getElementById('login-password');

  if (loginForm && loginEmail && loginPassword) {
    loginForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      try {
        const resposta = await fetch(`${API_BASE_URL}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emailUser: loginEmail.value.trim(),
            passwordUser: loginPassword.value,
          }),
        });
        const resultado = await resposta.json();

        if (!resposta.ok) {
          alert(resultado.erro || 'Não foi possível entrar.');
          return;
        }

        window.location.href = '/MainHub/frontend/index.html';
      } catch (error) {
        console.error('Erro ao entrar:', error);
        alert('Não foi possível conectar ao servidor. Tente novamente.');
      }
    });
  }

  // ----------------------------------------------------
  // FORMULÁRIO DE REGISTRO
  // ----------------------------------------------------
  const registerForm = document.getElementById('form-register');
  const registerName = document.getElementById('register-name');
  const registerEmail = document.getElementById('register-email');
  const registerPassword = document.getElementById('register-password');
  const registerConfirmPassword = document.getElementById('register-confirm-password');

  if (registerForm && registerName && registerEmail && registerPassword && registerConfirmPassword) {
    registerForm.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (registerPassword.value !== registerConfirmPassword.value) {
        alert('As senhas não coincidem.');
        registerConfirmPassword.focus();
        return;
      }

      const dados = {
        nameUser: registerName.value.trim(),
        emailUser: registerEmail.value.trim(),
        passwordUser: registerPassword.value,
      };

      try {
        const resposta = await fetch(`${API_BASE_URL}/usuarios`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(dados),
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
          alert(resultado.mensagem || 'Usuário cadastrado com sucesso!');
          registerForm.reset();
          switchState('login');
        } else {
          alert(resultado.erro || 'Falha ao cadastrar usuário.');
        }
      } catch (error) {
        console.error('Erro ao enviar dados:', error);
        alert('Não foi possível conectar ao servidor. Tente novamente.');
      }
    });
  }

  // ----------------------------------------------------
  // TELA 1: RECUPERAR SENHA (FORGOT-PASSWORD)
  // ----------------------------------------------------
  if (forgotForm && forgotEmail) {
    forgotForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      setFeedback('forgot-feedback', '');

      const emailVal = forgotEmail.value.trim();
      if (!emailVal) {
        setFeedback('forgot-feedback', 'Por favor, informe seu e-mail cadastrado.', 'error');
        return;
      }

      // Estado de carregamento do botão
      if (btnForgotSubmit) btnForgotSubmit.disabled = true;
      if (btnForgotText) btnForgotText.textContent = 'Enviando código...';

      try {
        const resposta = await fetch(`${API_BASE_URL}/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emailUser: emailVal }),
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
          currentRecoveryEmail = emailVal;
          if (resultado.devCode) {
            console.log(`%c[TaskFlowHub Dev]%c Código de verificação para ${emailVal}: ${resultado.devCode}`, 'color: #38bdf8; font-weight: bold;', 'color: #ffffff;');
          }

          // Transiciona para a tela de inserir o código
          switchState('verify-code');
          startResendCooldown(60);
          setFeedback('verify-feedback', resultado.mensagem || 'Código enviado! Verifique seu e-mail.', 'success');
        } else {
          setFeedback('forgot-feedback', resultado.mensagem || resultado.erro || 'E-mail não localizado.', 'error');
        }
      } catch (error) {
        console.error('Erro na solicitação de recuperação de senha:', error);
        setFeedback('forgot-feedback', 'Não foi possível conectar ao servidor. Verifique se o backend está em execução.', 'error');
      } finally {
        if (btnForgotSubmit) btnForgotSubmit.disabled = false;
        if (btnForgotText) btnForgotText.textContent = 'Enviar código de verificação';
      }
    });
  }

  // ----------------------------------------------------
  // TELA 2: INSERIR O CÓDIGO (VERIFY-CODE)
  // ----------------------------------------------------
  if (verifyForm) {
    verifyForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      setFeedback('verify-feedback', '');

      const code = getOtpValue();
      if (code.length < 6) {
        setFeedback('verify-feedback', 'Por favor, digite os 6 dígitos do código recebido.', 'error');
        const firstEmpty = otpInputs.find((input) => !input.value);
        if (firstEmpty) firstEmpty.focus();
        return;
      }

      if (btnVerifySubmit) btnVerifySubmit.disabled = true;
      if (btnVerifyText) btnVerifyText.textContent = 'Validando...';

      try {
        const resposta = await fetch(`${API_BASE_URL}/verify-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emailUser: currentRecoveryEmail,
            code: code,
          }),
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
          currentVerifiedCode = code;
          // Transiciona para a tela de definição da nova senha
          switchState('reset-password');
          setFeedback('reset-feedback', 'Código validado com sucesso! Crie sua nova senha abaixo.', 'success');
        } else {
          setFeedback('verify-feedback', resultado.erro || resultado.mensagem || 'Código incorreto ou expirado.', 'error');
          otpInputs[0]?.focus();
        }
      } catch (error) {
        console.error('Erro na validação do código:', error);
        setFeedback('verify-feedback', 'Erro ao conectar ao servidor. Tente novamente.', 'error');
      } finally {
        if (btnVerifySubmit) btnVerifySubmit.disabled = false;
        if (btnVerifyText) btnVerifyText.textContent = 'Verificar Código';
      }
    });
  }

  // Botão de Reenviar Código
  if (btnResendCode) {
    btnResendCode.addEventListener('click', async () => {
      if (!currentRecoveryEmail) {
        switchState('forgot');
        return;
      }

      btnResendCode.disabled = true;
      setFeedback('verify-feedback', 'Reenviando código...', 'success');

      try {
        const resposta = await fetch(`${API_BASE_URL}/forgot-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emailUser: currentRecoveryEmail }),
        });
        const resultado = await resposta.json();

        if (resposta.ok) {
          startResendCooldown(60);
          clearOtpInputs();
          otpInputs[0]?.focus();
          setFeedback('verify-feedback', 'Um novo código foi enviado!', 'success');
          if (resultado.devCode) {
            console.log(`%c[TaskFlowHub Dev]%c Novo código para ${currentRecoveryEmail}: ${resultado.devCode}`, 'color: #38bdf8; font-weight: bold;', 'color: #ffffff;');
          }
        } else {
          btnResendCode.disabled = false;
          setFeedback('verify-feedback', resultado.mensagem || 'Falha ao reenviar código.', 'error');
        }
      } catch (error) {
        btnResendCode.disabled = false;
        setFeedback('verify-feedback', 'Erro de conexão com o servidor.', 'error');
      }
    });
  }

  // ----------------------------------------------------
  // TELA 3: REDEFINIR SENHA (RESET-PASSWORD)
  // ----------------------------------------------------
  if (resetForm && resetNewPassword && resetConfirmPassword) {
    resetForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      setFeedback('reset-feedback', '');

      if (resetNewPassword.value.length < 6) {
        setFeedback('reset-feedback', 'A nova senha deve ter no mínimo 6 caracteres.', 'error');
        resetNewPassword.focus();
        return;
      }

      if (resetNewPassword.value !== resetConfirmPassword.value) {
        setFeedback('reset-feedback', 'As senhas não coincidem. Digite novamente.', 'error');
        resetConfirmPassword.focus();
        return;
      }

      if (btnResetSubmit) btnResetSubmit.disabled = true;
      if (btnResetText) btnResetText.textContent = 'Atualizando senha...';

      try {
        const resposta = await fetch(`${API_BASE_URL}/reset-password`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            emailUser: currentRecoveryEmail,
            code: currentVerifiedCode,
            newPassword: resetNewPassword.value,
          }),
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
          alert(resultado.mensagem || 'Senha redefinida com sucesso!');
          resetForm.reset();
          if (loginEmail) loginEmail.value = currentRecoveryEmail;
          switchState('login');
        } else {
          setFeedback('reset-feedback', resultado.erro || 'Falha ao atualizar senha.', 'error');
        }
      } catch (error) {
        console.error('Erro ao redefinir senha:', error);
        setFeedback('reset-feedback', 'Não foi possível conectar ao servidor.', 'error');
      } finally {
        if (btnResetSubmit) btnResetSubmit.disabled = false;
        if (btnResetText) btnResetText.textContent = 'Redefinir Senha';
      }
    });
  }

  // ----------------------------------------------------
  // ALTERNAR VISIBILIDADE DE SENHAS (OLHO ABERTO / FECHADO)
  // ----------------------------------------------------
  function setupPasswordToggle(btnId, inputId, openId, closedId) {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    const openEye = document.getElementById(openId);
    const closedEye = document.getElementById(closedId);

    if (btn && input && openEye && closedEye) {
      btn.addEventListener('click', () => {
        const isPassword = input.type === 'password';
        input.type = isPassword ? 'text' : 'password';
        openEye.classList.toggle('hidden', isPassword);
        closedEye.classList.toggle('hidden', !isPassword);
      });
    }
  }

  // Alternadores existentes
  setupPasswordToggle('btn-toggle-login-password', 'login-password', 'eye-open-login', 'eye-closed-login');
  setupPasswordToggle('btn-toggle-register-password', 'register-password', 'eye-open-register', 'eye-closed-register');
  setupPasswordToggle('btn-toggle-register-password-confirm', 'register-confirm-password', 'eye-open-register-confirm-password', 'eye-closed-register-confirm-password');

  // Alternadores da tela de reset de senha
  setupPasswordToggle('btn-toggle-reset-new-password', 'reset-new-password', 'eye-open-reset-new', 'eye-closed-reset-new');
  setupPasswordToggle('btn-toggle-reset-confirm-password', 'reset-confirm-password', 'eye-open-reset-confirm', 'eye-closed-reset-confirm');
}
