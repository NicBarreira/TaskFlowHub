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

  // Previne recarregamento ao submeter os formulários
  const forms = document.querySelectorAll('form');
  forms.forEach((form) => {
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      console.log('Formulário submetido com sucesso via JS.');
    });
  });

  const form = document.getElementById("form-register");
  const inpNome = document.getElementById("register-name");
  const inpEmail = document.getElementById("register-email");
  const inpPassword = document.getElementById("register-password");

  if (form && inpNome && inpEmail && inpPassword) {
    form.addEventListener('submit', async (event) => {
      event.preventDefault();

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
      }
    });
  }
}
