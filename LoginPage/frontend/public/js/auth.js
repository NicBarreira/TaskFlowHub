/**
 * Módulo de Autenticação
 * Gerencia a máquina de estados entre Login, Registro e Esqueci a Senha,
 * além do controle visual das abas e prevenção de envio padrão dos formulários.
 */
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
}
