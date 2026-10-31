/**
 * Módulo de Autenticação
 * Gerencia a máquina de estados entre Login, Registro e Esqueci a Senha,
 * além do controle visual das abas e prevenção de envio padrão dos formulários.
 */
const API_BASE_URL = 'http://localhost:3000/api';

function initAuth() {
  const tabsContainer = document.getElementById('tabs-container');
  const tabLogin = document.getElementById('tab-login');
  const tabRegister = document.getElementById('tab-register');

  const stateLogin = document.getElementById('state-login');
  const stateRegister = document.getElementById('state-register');
  const stateForgot = document.getElementById('state-forgot');

  const btnGotoForgot = document.getElementById('btn-goto-forgot');
  const btnBackToLogin = document.getElementById('btn-back-to-login');



  if (!tabsContainer || !tabLogin || !tabRegister) return;

  const activeTabClasses = ['bg-zinc-800', 'text-zinc-100', 'shadow-sm', 'border', 'border-zinc-700/40'];
  const inactiveTabClasses = ['text-zinc-400', 'hover:text-zinc-200'];

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
   * Altera a visibilidade das seções conforme o estado solicitado
   * @param {'login' | 'register' | 'forgot'} state 
   */
  function switchState(state) {
    [stateLogin, stateRegister, stateForgot].forEach((el) => {
      if (el) {
        el.classList.add('hidden');
        el.classList.remove('flex');
      }
    });

    switch (state) {
      case 'login':
        tabsContainer.classList.remove('hidden');
        updateTabs(tabLogin, tabRegister);
        stateLogin?.classList.remove('hidden');
        stateLogin?.classList.add('flex');
        break;

      case 'register':
        tabsContainer.classList.remove('hidden');
        updateTabs(tabRegister, tabLogin);
        stateRegister?.classList.remove('hidden');
        stateRegister?.classList.add('flex');
        break;

      case 'forgot':
        tabsContainer.classList.add('hidden');
        stateForgot?.classList.remove('hidden');
        stateForgot?.classList.add('flex');
        break;
    }
  }

  // Ouvintes de eventos para navegação
  tabLogin.addEventListener('click', () => switchState('login'));
  tabRegister.addEventListener('click', () => switchState('register'));
  btnGotoForgot?.addEventListener('click', () => switchState('forgot'));
  btnBackToLogin?.addEventListener('click', () => switchState('login'));

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
            emailUser: loginEmail.value,
            passwordUser: loginPassword.value
          })
        });
        const resultado = await resposta.json();

        if (!resposta.ok) {
          alert(resultado.erro || 'Não foi possível entrar.');
          return;
        }

        window.location.href = '/MainHub/frontend/index.html'
      } catch (error) {
        console.error('Erro ao entrar', error);
        alert('Não foi possível conectar ao servidor. Tente novamente.');
      }
    });
  }

  const form = document.getElementById('form-register');
  const inpNome = document.getElementById("register-name");
  const inpEmail = document.getElementById("register-email");
  const inpPassword = document.getElementById("register-password");
  const inpConfirmPassword = document.getElementById('register-confirm-password');



  if (form && inpNome && inpEmail && inpPassword && inpConfirmPassword) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

      if (inpPassword.value !== inpConfirmPassword.value) {
        alert('As senhas não coincidem.');
        inpConfirmPassword.focus();
        return;
      }

      const dados = {
        nameUser: inpNome.value,
        emailUser: inpEmail.value,
        passwordUser: inpPassword.value
      };

      try {
        const resposta = await fetch(`${API_BASE_URL}/usuarios`, {
          method: 'POST',
          headers: {
            'Content-type': 'application/json'
          },
          body: JSON.stringify(dados)
        });

        const resultado = await resposta.json();

        if (resposta.ok) {
          alert(resultado.mensagem);
          form.reset();
        } else {
          alert(resultado.erro);
        }
      } catch (error) {
        console.error("Erro ao enviar dados", error);
        alert('Não foi possível conectar ao servidor. Tente novamente.');
      }
    });
  }

  document.querySelector('#state-forgot form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    alert('A recuperação de senha ainda não está disponível.');
  });
  
  const togglePasswordBtn = document.getElementById("btn-toggle-login-password");
  const inpPasswordLogin = document.getElementById("login-password");
  const eyeOpen = document.getElementById("eye-open-login")
  const eyeClosed = document.getElementById("eye-closed-login");

  if(togglePasswordBtn && inpPasswordLogin && eyeOpen && eyeClosed)  {
    togglePasswordBtn.addEventListener('click', () => {
      inpPasswordLogin.type = inpPasswordLogin.type === 'password' ? 'text' : 'password';

      eyeOpen.classList.toggle('hidden');
      eyeClosed.classList.toggle('hidden');
    })
  }

  const btnToggleRegister = document.getElementById("btn-toggle-register-password");
  
  const eyeOpenRegister = document.getElementById("eye-open-register");
  const eyeClosedRegister = document.getElementById("eye-closed-register");

  if (btnToggleRegister && inpPassword && eyeOpenRegister && eyeClosedRegister) {
    btnToggleRegister.addEventListener('click', () => {
      // Alterna a senha
      inpPassword.type = inpPassword.type === 'password' ? 'text' : 'password';
      
      // Alterna os ícones
      eyeOpenRegister.classList.toggle('hidden');
      eyeClosedRegister.classList.toggle('hidden');
    });
  }

  const btnToggleRegisterConirm = document.getElementById("btn-toggle-register-password-confirm");
  
  const eyeOpenRegisterConfirmPassword = document.getElementById("eye-open-register-confirm-password");
  const eyeClosedRegisterConfirmPassword = document.getElementById("eye-closed-register-confirm-password");

  if(btnToggleRegisterConirm && inpConfirmPassword && eyeOpenRegisterConfirmPassword && eyeClosedRegisterConfirmPassword) {
    btnToggleRegisterConirm.addEventListener('click', () => {
      inpConfirmPassword.type = inpConfirmPassword.type === 'password' ? 'text' : 'password';

      eyeOpenRegisterConfirmPassword.classList.toggle('hidden');
      eyeClosedRegisterConfirmPassword.classList.toggle('hidden');
    })
  }

}
