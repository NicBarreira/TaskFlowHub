# TaskFlowHub

Uma plataforma web full-stack para gestão de projetos e tarefas, com interface Kanban interativa e fluxo completo de autenticação e recuperação de senha.

---

## 📌 Visão Geral

O **TaskFlowHub** é composto por uma arquitetura desacoplada:
- **Frontend:** Desenvolvido em HTML5, JavaScript Vanilla e estilizado com Tailwind CSS e CSS customizado (efeitos de glassmorphism e spotlight interativo). Inclui dashboard Kanban com suporte a drag-and-drop nativo.
- **Backend:** Desenvolvido em Node.js com Express e TypeScript (executado via `tsx`), seguindo o padrão MVC.
- **Banco de Dados:** PostgreSQL com pooling de conexões via biblioteca `pg`.
- **Comunicação por E-mail:** Envio de código OTP de 6 dígitos via Nodemailer para redefinição de credenciais.

---

## 📁 Estrutura do Projeto

```
TaskFlowHub/
├── LoginPage/
│   ├── backend/
│   │   ├── config/          # Configuração de banco de dados (db.ts)
│   │   ├── controllers/     # Regras de negócio e autenticação (authController.ts)
│   │   ├── routes/          # Definição dos endpoints REST (authRoutes.ts)
│   │   ├── service/         # Serviço de disparo de e-mails (mailService.ts)
│   │   └── server.ts        # Ponto de entrada da API Express
│   ├── database/
│   │   └── TaskFlowUser.sql # Scripts DDL do PostgreSQL
│   └── frontend/
│       ├── css/             # Folhas de estilo da autenticação
│       ├── js/              # Lógica da interface, formulários e spotlight
│       └── index.html       # Tela de login, cadastro e recuperação
├── MainHub/
│   └── frontend/
│       ├── css/             # Folhas de estilo do painel Kanban
│       ├── js/              # Controle de drag-and-drop das tarefas (app.js)
│       └── index.html       # Dashboard principal (Kanban)
├── package.json             # Dependências e scripts do projeto
├── tsconfig.json            # Configuração do TypeScript
└── README.md                # Documentação do projeto
```

---

## 🚀 Tecnologias Utilizadas

- **Runtime & Linguagem:** [Node.js](https://nodejs.org/) (v20+), [TypeScript](https://www.typescriptlang.org/)
- **Servidor Web:** [Express](https://expressjs.com/)
- **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/)
- **Criptografia & Segurança:** [bcrypt](https://www.npmjs.com/package/bcrypt), [CORS](https://www.npmjs.com/package/cors)
- **Envio de E-mails:** [Nodemailer](https://nodemailer.com/)
- **Estilização Frontend:** [Tailwind CSS](https://tailwindcss.com/), CSS3 moderno

---

## ⚙️ Pré-requisitos

Antes de iniciar, certifique-se de possuir instalado em sua máquina:
- **Node.js** (versão 20 ou superior)
- **npm** (gerenciador de pacotes integrado ao Node)
- **PostgreSQL** instalado e em execução

---

## 🔧 Configuração e Instalação

1. **Clone o repositório:**
   ```bash
   git clone https://github.com/NicBarreira/TaskFlowHub.git
   cd TaskFlowHub
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   ```

3. **Configure as Variáveis de Ambiente:**
   Crie um arquivo `.env` na raiz do projeto com base nas seguintes variáveis:
   ```env
   PORT=3000

   # Banco de Dados PostgreSQL
   DB_USER=seu_usuario
   DB_HOST=localhost
   DB_NAME=TaskFlowHub
   DB_PASSWORD=sua_senha
   DB_PORT=5432

   # Serviço de Envio de E-mail (SMTP)
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=seu_email@gmail.com
   SMTP_PASS=sua_senha_de_aplicativo
   ```

4. **Inicialize o Banco de Dados:**
   Execute o script SQL localizado em `LoginPage/database/TaskFlowUser.sql` no seu servidor PostgreSQL para criar o banco de dados e a tabela de usuários:
   ```bash
   psql -U seu_usuario -f LoginPage/database/TaskFlowUser.sql
   ```

---

## 🏃 Executando a Aplicação

1. **Inicie o servidor Backend:**
   ```bash
   npm run dev
   ```
   O servidor iniciará em `http://localhost:3000`.

2. **Acesse as Interfaces:**
   - **Autenticação:** Abra o arquivo `LoginPage/frontend/index.html` no navegador ou utilize uma extensão de servidor estático (ex.: Live Server).
   - **Kanban (MainHub):** Acesse `MainHub/frontend/index.html` após autenticar.

---

## 🔌 Endpoints da API

| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/api/usuarios` | Cadastra um novo usuário (nome, e-mail e senha com hash bcrypt). |
| `GET` | `/api/usuarios` | Lista os usuários cadastrados (id, nome e e-mail). |
| `POST` | `/api/login` | Realiza a autenticação comparando a senha criptografada. |
| `POST` | `/api/forgot-password` | Dispara o e-mail com código OTP de 6 dígitos para recuperação de senha. |
| `POST` | `/api/verify-code` | Valida se o código de 6 dígitos informado é válido e está dentro do prazo. |
| `POST` | `/api/reset-password` | Redefine a senha do usuário utilizando o código validado. |

---

## 📄 Licença

Este projeto é open-source e está sob a licença [MIT](LICENSE).
