import express, { Request, Response } from 'express';
import path from 'path';
import cors from 'cors';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuração do PostgreSQL
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'pstlTaskFlow',
  database: process.env.DB_NAME || 'taskflowUsers',
});

// Ensure the required tables exist


// Middlewares
app.use(cors());
app.use(express.json());

// Servir arquivos estáticos do Front-end
const frontendPublicPath = path.join(__dirname, '../frontend/public');
const frontendAssetsPath = path.join(__dirname, '../frontend/assets');

app.use(express.static(frontendPublicPath));
app.use('/assets', express.static(frontendAssetsPath));

const welcomeHtmlPath = path.join(frontendPublicPath, 'Welcome.html');

// --- ROTAS DA API ---

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'TaskFlow Hub API rodando!' });
});

// Rota de Cadastro de Usuário
app.post('/api/register', async (req: Request, res: Response) => {
  try {
    const { fullName, username, email, password, locale } = req.body;

    if (!fullName || !username || !email || !password) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios.' });
    }

    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Inserir no PostgreSQL
    const queryText = `
      INSERT INTO users (realname, username, email, password, language)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, username, email;
    `;
    const values = [fullName, username, email, hashedPassword, locale || 'pt-BR'];

    const result = await pool.query(queryText, values);

    return res.status(201).json({
      message: 'Usuário cadastrado com sucesso!',
      user: result.rows[0],
    });
  } catch (error: any) {
    console.error('Erro no cadastro:', error);

    // Tratamento de violação de valor único (username ou e-mail já existentes)
    if (error.code === '23505') {
      return res.status(400).json({ error: 'Username ou e-mail já cadastrados.' });
    }

    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// Rota de Login
app.post('/api/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios.' });
    }

    // Buscar usuário
    const userResult = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'Usuário ou senha incorretos.' });
    }

    const user = userResult.rows[0];

    // Record exists - success
    return res.status(200).json({
      message: 'Login bem-sucedido! Usuário encontrado.',
      user: { id: user.id, username: user.username, email: user.email },
    });
  } catch (error) {
    console.error('Erro no login:', error);
    return res.status(500).json({ error: 'Erro interno no servidor.' });
  }
});

// SPA Fallback: Qualquer rota que não seja /api entrega a página principal
app.get('/*', (req: Request, res: Response) => {
  res.sendFile(welcomeHtmlPath);
});

// Inicialização do Servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
});