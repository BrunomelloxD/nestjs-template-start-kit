import { Injectable } from "@nestjs/common";
import { IPasswordRecoveryRepository } from "./password-recovery.repository.interface";
import { PrismaService } from "src/common/prisma/services/prisma.service";

@Injectable()
export class PasswordRecoveryRepository implements IPasswordRecoveryRepository {
    constructor(private readonly prisma: PrismaService) { }

    async recoverPassword(code: string, expiresAt: Date, user_id: string): Promise<void> {
        await this.prisma.passwordResetCode.create({
            data: {
                code,
                expires_at: expiresAt,
                user_id: user_id,
            },
        })
    }

    async findByRecoveryCode(code: string, user_id: string): Promise<boolean> {
        const passwordResetCode = await this.prisma.passwordResetCode.findFirst({
            where: { code, user_id, used: false, expires_at: { gte: new Date() } },
        });

        return !!passwordResetCode;
    }

    async delete(user_id: string): Promise<void> {
        await this.prisma.passwordResetCode.updateMany({
            where: { user_id, used: false },
            data: { used: true },
        });
    }
}