import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';

export const registerUser = async (req: Request, res: Response) => {
  const { nameUser, emailUser, passwordUser } = req.body;

  if (!nameUser || !emailUser || !passwordUser) {
    return res.status(400).json({ erro: 'Nome, e-mail e password são obrigatórios.' });
  }

  try {
    const saltRounds = 10;
    const hashedPasswordUser = await bcrypt.hash(passwordUser, saltRounds);

    const query = `
      INSERT INTO TaskFlowUsers("nameUser", "emailUser", "passwordUser")
      VALUES($1, $2, $3)
      RETURNING id, "nameUser", "emailUser";
    `;

    const values = [nameUser, emailUser, hashedPasswordUser];
    const result = await pool.query(query, values);

    return res.status(201).json({
      mensagem: 'Usuário cadastrado com sucesso!',
      Usuario: result.rows[0],
    });
  } catch (error: any) {
    console.error('Erro ao cadastrar um usuário: ', error);
    if (error.code === '23505') {
      return res.status(409).json({
        erro: 'E-mail já cadastrado',
      });
    }
    return res.status(500).json({
      erro: 'Erro interno ao salvar no banco de dados',
    });
  }
};

export const listUsers = async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT id, "nameUser", "emailUser" FROM TaskFlowUsers ORDER BY id ASC;');
    return res.json(result.rows);
  } catch (error) {
    console.error('Erro ao listar usuários', error);
    return res.status(500).json({
      erro: 'Erro interno ao consultar o banco de dados',
    });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { emailUser, passwordUser } = req.body;

  if (!emailUser || !passwordUser) {
    return res.status(400).json({
      erro: 'E-mail e senha são obrigatórios!',
    });
  }

  try {
    const result = await pool.query(
      'SELECT id, "nameUser", "emailUser", "passwordUser" FROM TaskFlowUsers WHERE "emailUser" = $1;',
      [emailUser]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        erro: 'Usuário ou senha incorretos',
      });
    }

    const usuario = result.rows[0];
    const senhaValida = await bcrypt.compare(passwordUser, usuario.passwordUser);

    if (!senhaValida) {
      return res.status(401).json({
        erro: 'Usuário ou Senha inválida!',
      });
    }

    return res.json({
      mensagem: 'Login realizado com sucesso!',
      usuarios: {
        id: usuario.id,
        nameUser: usuario.nameUser,
        emailUser: usuario.emailUser,
      },
    });
  } catch (error) {
    console.error('Erro no login: ', error);
    return res.status(500).json({
      erro: 'Erro interno do servidor',
    });
  }
};
