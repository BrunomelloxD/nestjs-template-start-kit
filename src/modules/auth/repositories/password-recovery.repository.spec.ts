import { Test, TestingModule } from '@nestjs/testing';
import { PasswordRecoveryRepository } from './password-recovery.repository';
import { PrismaService } from 'src/common/prisma/services/prisma.service';

describe('PasswordRecoveryRepository', () => {
    let repository: PasswordRecoveryRepository;
    let prismaService: jest.Mocked<PrismaService>;

    const mockPrismaService = {
        passwordResetCode: {
            create: jest.fn(),
            findFirst: jest.fn(),
            updateMany: jest.fn(),
        },
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PasswordRecoveryRepository,
                {
                    provide: PrismaService,
                    useValue: mockPrismaService,
                },
            ],
        }).compile();

        repository = module.get<PasswordRecoveryRepository>(PasswordRecoveryRepository);
        prismaService = module.get(PrismaService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('recoverPassword', () => {
        it('should create a password reset code successfully', async () => {
            const code = '123456';
            const expiresAt = new Date('2024-12-31T23:59:59.000Z');
            const userId = 'user-123';

            mockPrismaService.passwordResetCode.create.mockResolvedValue({
                id: 'reset-code-id',
                code,
                expires_at: expiresAt,
                user_id: userId,
                used: false,
                created_at: new Date(),
            });

            await repository.recoverPassword(code, expiresAt, userId);

            expect(mockPrismaService.passwordResetCode.create).toHaveBeenCalledTimes(1);
            expect(mockPrismaService.passwordResetCode.create).toHaveBeenCalledWith({
                data: {
                    code,
                    expires_at: expiresAt,
                    user_id: userId,
                },
            });
        });

        it('should throw error when create fails', async () => {
            const code = '123456';
            const expiresAt = new Date('2024-12-31T23:59:59.000Z');
            const userId = 'user-123';
            const error = new Error('Database error');

            mockPrismaService.passwordResetCode.create.mockRejectedValue(error);

            await expect(repository.recoverPassword(code, expiresAt, userId))
                .rejects.toThrow('Database error');

            expect(mockPrismaService.passwordResetCode.create).toHaveBeenCalledTimes(1);
        });
    });

    describe('findByRecoveryCode', () => {
        it('should return true when valid recovery code exists', async () => {
            const code = '123456';
            const userId = 'user-123';
            const mockResetCode = {
                id: 'reset-code-id',
                code,
                expires_at: new Date('2024-12-31T23:59:59.000Z'),
                user_id: userId,
                used: false,
                created_at: new Date(),
            };

            mockPrismaService.passwordResetCode.findFirst.mockResolvedValue(mockResetCode);

            const result = await repository.findByRecoveryCode(code, userId);

            expect(result).toBe(true);
            expect(mockPrismaService.passwordResetCode.findFirst).toHaveBeenCalledTimes(1);
            expect(mockPrismaService.passwordResetCode.findFirst).toHaveBeenCalledWith({
                where: {
                    code,
                    user_id: userId,
                    used: false,
                    expires_at: { gte: expect.any(Date) }
                },
            });
        });

        it('should return false when recovery code does not exist', async () => {
            const code = '123456';
            const userId = 'user-123';

            mockPrismaService.passwordResetCode.findFirst.mockResolvedValue(null);

            const result = await repository.findByRecoveryCode(code, userId);

            expect(result).toBe(false);
            expect(mockPrismaService.passwordResetCode.findFirst).toHaveBeenCalledTimes(1);
        });

        it('should return false when recovery code is expired', async () => {
            const code = '123456';
            const userId = 'user-123';

            mockPrismaService.passwordResetCode.findFirst.mockResolvedValue(null);

            const result = await repository.findByRecoveryCode(code, userId);

            expect(result).toBe(false);
            expect(mockPrismaService.passwordResetCode.findFirst).toHaveBeenCalledTimes(1);
        });

        it('should return false when recovery code is already used', async () => {
            const code = '123456';
            const userId = 'user-123';

            mockPrismaService.passwordResetCode.findFirst.mockResolvedValue(null);

            const result = await repository.findByRecoveryCode(code, userId);

            expect(result).toBe(false);
            expect(mockPrismaService.passwordResetCode.findFirst).toHaveBeenCalledTimes(1);
        });

        it('should throw error when findFirst fails', async () => {
            const code = '123456';
            const userId = 'user-123';
            const error = new Error('Database error');

            mockPrismaService.passwordResetCode.findFirst.mockRejectedValue(error);

            await expect(repository.findByRecoveryCode(code, userId))
                .rejects.toThrow('Database error');

            expect(mockPrismaService.passwordResetCode.findFirst).toHaveBeenCalledTimes(1);
        });
    });

    describe('delete', () => {
        it('should mark unused password reset codes as used successfully', async () => {
            const userId = 'user-123';

            mockPrismaService.passwordResetCode.updateMany.mockResolvedValue({ count: 2 });

            await repository.delete(userId);

            expect(mockPrismaService.passwordResetCode.updateMany).toHaveBeenCalledTimes(1);
            expect(mockPrismaService.passwordResetCode.updateMany).toHaveBeenCalledWith({
                where: { user_id: userId, used: false },
                data: { used: true },
            });
        });

        it('should handle case when no unused codes exist', async () => {
            const userId = 'user-123';

            mockPrismaService.passwordResetCode.updateMany.mockResolvedValue({ count: 0 });

            await repository.delete(userId);

            expect(mockPrismaService.passwordResetCode.updateMany).toHaveBeenCalledTimes(1);
            expect(mockPrismaService.passwordResetCode.updateMany).toHaveBeenCalledWith({
                where: { user_id: userId, used: false },
                data: { used: true },
            });
        });

        it('should throw error when updateMany fails', async () => {
            const userId = 'user-123';
            const error = new Error('Database error');

            mockPrismaService.passwordResetCode.updateMany.mockRejectedValue(error);

            await expect(repository.delete(userId))
                .rejects.toThrow('Database error');

            expect(mockPrismaService.passwordResetCode.updateMany).toHaveBeenCalledTimes(1);
        });
    });

    describe('Integration scenarios', () => {
        it('should handle complete password recovery flow', async () => {
            const code = '123456';
            const userId = 'user-123';
            const expiresAt = new Date(Date.now() + 60000);

            mockPrismaService.passwordResetCode.create.mockResolvedValue({
                id: 'reset-code-id',
                code,
                expires_at: expiresAt,
                user_id: userId,
                used: false,
                created_at: new Date(),
            });

            mockPrismaService.passwordResetCode.findFirst.mockResolvedValue({
                id: 'reset-code-id',
                code,
                expires_at: expiresAt,
                user_id: userId,
                used: false,
                created_at: new Date(),
            });

            mockPrismaService.passwordResetCode.updateMany.mockResolvedValue({ count: 1 });

            await repository.recoverPassword(code, expiresAt, userId);
            expect(mockPrismaService.passwordResetCode.create).toHaveBeenCalledTimes(1);

            const found = await repository.findByRecoveryCode(code, userId);
            expect(mockPrismaService.passwordResetCode.findFirst).toHaveBeenCalledTimes(1);

            await repository.delete(userId);
            expect(mockPrismaService.passwordResetCode.updateMany).toHaveBeenCalledTimes(1);
        });
    });
});