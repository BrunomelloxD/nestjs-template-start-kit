import { compare, hash } from 'bcrypt';
import { security } from '../../../common/config/env.config';
import { Injectable, NotFoundException } from "@nestjs/common";
import * as bcrypt from 'bcrypt';
import { PasswordRecoveryRepository } from "../repositories/password-recovery.repository";
import { UserService } from "src/modules/users/services/user.service";
import { MailService } from 'src/modules/mail/services/mail.service';

@Injectable()
export class PasswordService {
    constructor(private readonly passwordRecoveryRepository: PasswordRecoveryRepository, private readonly mailService: MailService, private readonly userService: UserService) { }

    async hash(password: string): Promise<string> {
        return hash(password, security.bcrypt.saltRounds);
    }

    async compare(plainPassword: string, hashedPassword: string): Promise<boolean> {
        return compare(plainPassword, hashedPassword);
    }

    async recoverPassword(email: string): Promise<void> {
        const user = await this.userService.findByEmail(email);

        if (!user) {
            throw new NotFoundException(`User with email ${email} not found`);
        }

        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

        await this.passwordRecoveryRepository.delete(user.id);

        await this.passwordRecoveryRepository.recoverPassword(code, expiresAt, user.id);

        await this.mailService.sendRecoveryCode(user.email, code);
    }

    async verifyRecoveryCode(data: { email: string, code: string }): Promise<void> {
        const user = await this.userService.findByEmail(data.email);

        if (!user) {
            throw new NotFoundException(`User with email ${data.email} not found`);
        }

        const codeData = await this.passwordRecoveryRepository.findByRecoveryCode(data.code, user.id);

        if (!codeData) {
            throw new NotFoundException(`Recovery code ${data.code} not found`);
        }
    }

    async resetPassword(data: { email: string, password: string }) {
        const user = await this.userService.findByEmail(data.email);

        if (!user) {
            throw new NotFoundException(`User with email ${data.email} not found`);
        }

        const hashedPassword = bcrypt.hashSync(data.password, security.bcrypt.saltRounds);
        await this.userService.update(user.id, { password: hashedPassword });

        await this.passwordRecoveryRepository.delete(user.id);
    }
}