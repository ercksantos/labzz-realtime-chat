import nodemailer, { Transporter } from 'nodemailer';
import { emailQueue, EmailJob } from '../queue/queues';
import logger from '../utils/logger';

export class EmailService {
    private transporter: Transporter;

    constructor() {
        // Configurar transporter (usar SMTP ou serviço como SendGrid, Mailgun)
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD,
            },
        });
    }

    // Templates de email
    private getEmailTemplate(template: string, data: Record<string, any>): string {
        const templates: Record<string, (data: any) => string> = {
            welcome: (data) => `
        <h1>Bem-vindo ao Labzz Chat, ${data.name}!</h1>
        <p>Obrigado por se cadastrar em nossa plataforma.</p>
        <p>Você pode fazer login usando seu email: <strong>${data.email}</strong></p>
      `,

            passwordReset: (data) => `
        <h1>Redefinição de Senha</h1>
        <p>Olá ${data.name},</p>
        <p>Você solicitou a redefinição de senha. Clique no link abaixo:</p>
        <a href="${data.resetLink}">Redefinir Senha</a>
        <p>Este link expira em 1 hora.</p>
        <p>Se você não solicitou isso, ignore este email.</p>
      `,

            newMessage: (data) => `
        <h1>Nova Mensagem</h1>
        <p>Olá ${data.recipientName},</p>
        <p><strong>${data.senderName}</strong> enviou uma mensagem:</p>
        <blockquote>${data.message}</blockquote>
        <a href="${data.chatLink}">Ver Conversa</a>
      `,

            conversationInvite: (data) => `
        <h1>Convite para Conversa</h1>
        <p>Olá ${data.recipientName},</p>
        <p><strong>${data.inviterName}</strong> adicionou você a uma conversa${data.conversationName ? `: <strong>${data.conversationName}</strong>` : ''}.</p>
        <a href="${data.chatLink}">Abrir Conversa</a>
      `,
        };

        return templates[template]?.(data) || '<p>Template não encontrado</p>';
    }

    // Enviar email diretamente
    async sendEmail(job: EmailJob): Promise<void> {
        try {
            const htmlContent = this.getEmailTemplate(job.template, job.data);

            await this.transporter.sendMail({
                from: process.env.SMTP_FROM || 'noreply@labzz.chat',
                to: job.to,
                subject: job.subject,
                html: htmlContent,
            });

            logger.info(`Email enviado para ${job.to}: ${job.subject}`);
        } catch (error) {
            logger.error('Erro ao enviar email:', error);
            throw error;
        }
    }

    // Adicionar job à fila de emails
    async queueEmail(job: EmailJob, options?: { delay?: number; priority?: number }): Promise<void> {
        try {
            await emailQueue.add('send-email', job, {
                delay: options?.delay,
                priority: options?.priority,
            });

            logger.debug(`Email adicionado à fila: ${job.subject}`);
        } catch (error) {
            logger.error('Erro ao adicionar email à fila:', error);
            throw error;
        }
    }

    // Métodos de atalho para emails comuns
    async sendWelcomeEmail(email: string, name: string): Promise<void> {
        await this.queueEmail({
            to: email,
            subject: 'Bem-vindo ao Labzz Chat!',
            template: 'welcome',
            data: { email, name },
        });
    }

    async sendPasswordResetEmail(email: string, name: string, resetToken: string): Promise<void> {
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        await this.queueEmail(
            {
                to: email,
                subject: 'Redefinição de Senha - Labzz Chat',
                template: 'passwordReset',
                data: { name, resetLink },
            },
            { priority: 1 } // Alta prioridade
        );
    }

    async sendNewMessageEmail(
        recipientEmail: string,
        recipientName: string,
        senderName: string,
        message: string,
        conversationId: string
    ): Promise<void> {
        const chatLink = `${process.env.FRONTEND_URL}/chat/${conversationId}`;

        await this.queueEmail({
            to: recipientEmail,
            subject: `Nova mensagem de ${senderName}`,
            template: 'newMessage',
            data: { recipientName, senderName, message, chatLink },
        });
    }

    async sendConversationInviteEmail(
        recipientEmail: string,
        recipientName: string,
        inviterName: string,
        conversationId: string,
        conversationName?: string
    ): Promise<void> {
        const chatLink = `${process.env.FRONTEND_URL}/chat/${conversationId}`;

        await this.queueEmail({
            to: recipientEmail,
            subject: `${inviterName} adicionou você a uma conversa`,
            template: 'conversationInvite',
            data: { recipientName, inviterName, conversationName, chatLink },
        });
    }

    // Verificar conexão SMTP
    async verifyConnection(): Promise<boolean> {
        try {
            await this.transporter.verify();
            logger.info('✅ Conexão SMTP verificada');
            return true;
        } catch (error) {
            logger.error('❌ Erro na conexão SMTP:', error);
            return false;
        }
    }
}

export default new EmailService();
