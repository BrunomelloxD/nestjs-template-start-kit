export abstract class IPasswordRecoveryRepository {
    abstract recoverPassword(code: string, expiresAt: Date, userId: string): Promise<void>;
    abstract findByRecoveryCode(code: string, email: string): Promise<boolean>;
    abstract delete(userId: string): Promise<void>;
}