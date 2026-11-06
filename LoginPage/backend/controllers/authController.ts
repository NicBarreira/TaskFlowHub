import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import { pool } from '../config/db.js';
import { sendRecoveryCodeEmail } from '../service/mailService.js'; 

export const registerUser = async (req: Request, res: Response) => {
  const { nameUser, emailUser, passwordUser } = req.body;


  if (!nameUser || !emailUser || !passwordUser) {
    return res.status(400).json({ erro: 'Nome, e-mail e password são obrigatórios.' });
  }

  const normalizedEmail = emailUser.trim().toLowerCase();

  

  try {
    const saltRounds = 10;
    const hashedPasswordUser = await bcrypt.hash(passwordUser, saltRounds);

    const query = `
      INSERT INTO TaskFlowUsers("nameUser", "emailUser", "passwordUser")
      VALUES($1, $2, $3)
      RETURNING id, "nameUser", "emailUser";
    `;

    const values = [nameUser.trim(), normalizedEmail, hashedPasswordUser ];
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

  const normalizedEmail = emailUser.trim().toLowerCase();

  try {
    const result = await pool.query(
      'SELECT id, "nameUser", "emailUser", "passwordUser" FROM TaskFlowUsers WHERE "emailUser" = $1;',
      [normalizedEmail]
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

interface RecoveryCodeEntry {
  code: string;
  expiresAt: number;
}

const recoveryCodes = new Map<string, RecoveryCodeEntry>();

export const forgotPassword = async (req: Request, res: Response) => {
  const { emailUser } = req.body;

  if (!emailUser) {
    return res.status(400).json({
      mensagem: 'O campo de e-mail deve ser preenchido',
    });
  }

  try {
    const normalizedEmail = emailUser.trim().toLowerCase();
    const result = await pool.query(
      'SELECT id, "nameUser", "emailUser" FROM TaskFlowUsers WHERE "emailUser" = $1;',
      [normalizedEmail]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        mensagem: 'E-mail não foi encontrado no sistema.',
      });
    }

    const usuario = result.rows[0];

    // Gera um código de verificação numérico de 6 dígitos
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = Date.now() + 15 * 60 * 1000; // Validade de 15 minutos

    recoveryCodes.set(normalizedEmail, { code, expiresAt });


    try{
      await sendRecoveryCodeEmail(usuario.emailUser, usuario.nameUser, code);
    } catch(mailError){
      console.error('Falha ao enviar e-mail de recuperação', mailError);
      return res.status(500).json({
        erro: 'Não foi possível enviar o e-mail com o código. Tente novamente.'
      });
    }

    console.log(`\n========================================`);
    console.log(`[TaskFlowHub] CÓDIGO DE RECUPERAÇÃO`);
    console.log(`Usuário: ${usuario.nameUser}`);
    console.log(`E-mail: ${usuario.emailUser}`);
    console.log(`Código: ${code}`);
    console.log(`Expira em: 15 minutos`);
    console.log(`========================================\n`);

    return res.status(200).json({
      mensagem: 'Código de verificação enviado com sucesso!',
      usuario: {
        id: usuario.id,
        emailUser: usuario.emailUser,
      },
    });
  } catch (error) {
    console.error('Erro ao verificar e-mail para recuperação!', error);
    return res.status(500).json({
      erro: 'Erro interno ao consultar banco de dados',
    });
  }
};

export const verifyCode = async (req: Request, res: Response) => {
  const { emailUser, code } = req.body;

  if (!emailUser || !code) {
    return res.status(400).json({
      erro: 'E-mail e código de verificação são obrigatórios.',
    });
  }

  const normalizedEmail = emailUser.trim().toLowerCase();
  const entry = recoveryCodes.get(normalizedEmail);

  if (!entry) {
    return res.status(400).json({
      erro: 'Nenhum código ativo foi encontrado para este e-mail. Solicite um novo código.',
    });
  }

  if (Date.now() > entry.expiresAt) {
    recoveryCodes.delete(normalizedEmail);
    return res.status(400).json({
      erro: 'O código de verificação expirou. Solicite um novo código.',
    });
  }

  if (entry.code !== code.toString().trim()) {
    return res.status(400).json({
      erro: 'Código de verificação incorreto. Tente novamente.',
    });
  }

  return res.status(200).json({
    mensagem: 'Código validado com sucesso!',
  });
};

export const resetPassword = async (req: Request, res: Response) => {
  const { emailUser, code, newPassword } = req.body;

  if (!emailUser || !code || !newPassword) {
    return res.status(400).json({
      erro: 'E-mail, código e nova senha são obrigatórios.',
    });
  }

  const normalizedEmail = emailUser.trim().toLowerCase();
  const entry = recoveryCodes.get(normalizedEmail);

  if (!entry || entry.code !== code.toString().trim() || Date.now() > entry.expiresAt) {
    return res.status(400).json({
      erro: 'Código inválido ou expirado. Reinicie o processo de recuperação.',
    });
  }

  try {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    await pool.query(
      'UPDATE TaskFlowUsers SET "passwordUser" = $1 WHERE "emailUser" = $2;',
      [hashedPassword, normalizedEmail]
    );

    recoveryCodes.delete(normalizedEmail);

    return res.status(200).json({
      mensagem: 'Senha redefinida com sucesso! Você já pode entrar com sua nova senha.',
    });
  } catch (error) {
    console.error('Erro ao redefinir a senha do usuário:', error);
    return res.status(500).json({
      erro: 'Erro interno ao atualizar a senha no banco de dados.',
    });
  }
};
