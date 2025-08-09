import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { security, server } from '../../../common/config/env.config';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

@Injectable()
export class MailService {
    private transporter = nodemailer.createTransport({
        host: security.email.host,
        port: security.email.port ? +security.email.port : 587,
        secure: security.email.port ? +security.email.port === 465 : false,
        auth: {
            user: security.email.mail,
            pass: security.email.pass,
        },
        tls: { rejectUnauthorized: false },
    } as SMTPTransport.Options);

    async sendRecoveryCode(to: string, code: string): Promise<void> {
        await this.transporter.sendMail({
            from: `Recuperação de senha - ${server.config.name}`,
            to,
            subject: `Recuperação de senha - ${server.config.name}`,
            text: `Seu código de recuperação é: ${code}`,
            html: `<p>Seu código de recuperação é: <strong>${code}</strong></p>`,
        });
    }
}