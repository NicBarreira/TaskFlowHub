import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});


export const sendRecoveryCodeEmail = async(to: string, name: string, code: string) => {
    await transporter.sendMail({
        from: `"TaskFlowHub" <${process.env.SMTP_USER}>`,
        to,
        subject: 'Código de recuperação de Senha - TaskFlowHUB',
        html: `
          <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background-color: #18181b; 
          color: #f4f4f5; border-radius: 12px;"> 
            <h2 style="color: #ffffff; margin-top: 0;">Recuperação de Senha</h2>
            <p>Olá, <strong>${name}</strong>!</p>
            <p>Recebemos uma solicitação de redefinição de senha para sua conta no TaskFlowHub. Use o código de 6 dígitos  
            abaixo:</p>
            <div style="background-color: #27272a; padding: 18px; text-align: center; font-size: 28px; font-weight: bold;    
            letter-spacing: 6px; border-radius: 8px; margin: 24px 0; color: #38bdf8; border: 1px solid #3f3f46;"> 
              ${code} 
            </div> 
            <p style="font-size: 13px; color: #a1a1aa; margin-bottom: 0;">Este código expira em 15 minutos. Se você não fez 
            essa solicitação, desconsidere este e-mail.</p>
          </div>
        `, 
    });
};