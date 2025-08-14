import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PasswordService } from './password.service';
import { PasswordRecoveryRepository } from '../repositories/password-recovery.repository';
import { UserService } from 'src/modules/users/services/user.service';
import { MailService } from 'src/modules/mail/services/mail.service';
import { User } from 'generated/prisma';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

jest.mock('../../../common/config/env.config', () => ({
    security: {
        bcrypt: {
            saltRounds: 12
        }
    }
}));

describe('PasswordService', () => {
    let service: PasswordService;
    let passwordRecoveryRepository: jest.Mocked<PasswordRecoveryRepository>;
    let userService: jest.Mocked<UserService>;
    let mailService: jest.Mocked<MailService>;

    const mockPasswordRecoveryRepository = {
        recoverPassword: jest.fn(),
        findByRecoveryCode: jest.fn(),
        delete: jest.fn(),
    };

    const mockUserService = {
        findByEmail: jest.fn(),
        update: jest.fn(),
    };

    const mockMailService = {
        sendRecoveryCode: jest.fn(),
    };

    const mockUser: User = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        password: '$2b$12$hashedPassword',
        email_verified: true,
        created_at: new Date(),
        updated_at: new Date(),
        deleted_at: null,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PasswordService,
                {
                    provide: PasswordRecoveryRepository,
                    useValue: mockPasswordRecoveryRepository,
                },
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
                {
                    provide: MailService,
                    useValue: mockMailService,
                },
            ],
        }).compile();

        service = module.get<PasswordService>(PasswordService);
        passwordRecoveryRepository = module.get(PasswordRecoveryRepository);
        userService = module.get(UserService);
        mailService = module.get(MailService);

        mockedBcrypt.hash.mockResolvedValue('$2b$12$hashedPassword' as never);
        mockedBcrypt.compare.mockResolvedValue(true as never);
        mockedBcrypt.hashSync.mockReturnValue('$2b$12$hashedPasswordSync');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('hash', () => {
        it('should hash a password successfully', async () => {
            const password = 'plainPassword123';
            const hashedPassword = '$2b$12$hashedTestPassword';
            mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);

            const result = await service.hash(password);

            expect(result).toBe(hashedPassword);
            expect(mockedBcrypt.hash).toHaveBeenCalledWith(password, 12);
            expect(mockedBcrypt.hash).toHaveBeenCalledTimes(1);
        });

        it('should throw error when hash fails', async () => {
            const password = 'plainPassword123';
            const error = new Error('Hash error');
            mockedBcrypt.hash.mockRejectedValue(error as never);

            await expect(service.hash(password)).rejects.toThrow('Hash error');
            expect(mockedBcrypt.hash).toHaveBeenCalledWith(password, 12);
        });
    });

    describe('compare', () => {
        it('should compare passwords successfully and return true', async () => {
            const plainPassword = 'plainPassword123';
            const hashedPassword = '$2b$12$hashedPassword';
            mockedBcrypt.compare.mockResolvedValue(true as never);

            const result = await service.compare(plainPassword, hashedPassword);

            expect(result).toBe(true);
            expect(mockedBcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
            expect(mockedBcrypt.compare).toHaveBeenCalledTimes(1);
        });

        it('should compare passwords successfully and return false', async () => {
            const plainPassword = 'plainPassword123';
            const hashedPassword = '$2b$12$hashedPassword';
            mockedBcrypt.compare.mockResolvedValue(false as never);

            const result = await service.compare(plainPassword, hashedPassword);

            expect(result).toBe(false);
            expect(mockedBcrypt.compare).toHaveBeenCalledWith(plainPassword, hashedPassword);
        });

        it('should throw error when compare fails', async () => {
            const plainPassword = 'plainPassword123';
            const hashedPassword = '$2b$12$hashedPassword';
            const error = new Error('Compare error');
            mockedBcrypt.compare.mockRejectedValue(error as never);

            await expect(service.compare(plainPassword, hashedPassword)).rejects.toThrow('Compare error');
        });
    });

    describe('recoverPassword', () => {
        it('should initiate password recovery successfully', async () => {
            const email = 'test@example.com';
            userService.findByEmail.mockResolvedValue(mockUser);
            passwordRecoveryRepository.delete.mockResolvedValue();
            passwordRecoveryRepository.recoverPassword.mockResolvedValue();
            mailService.sendRecoveryCode.mockResolvedValue();

            jest.spyOn(Math, 'random').mockReturnValue(0.5);

            await service.recoverPassword(email);

            expect(userService.findByEmail).toHaveBeenCalledWith(email);
            expect(userService.findByEmail).toHaveBeenCalledTimes(1);
            expect(passwordRecoveryRepository.delete).toHaveBeenCalledWith(mockUser.id);
            expect(passwordRecoveryRepository.delete).toHaveBeenCalledTimes(1);

            expect(passwordRecoveryRepository.recoverPassword).toHaveBeenCalledWith(
                '550000',
                expect.any(Date),
                mockUser.id
            );
            expect(passwordRecoveryRepository.recoverPassword).toHaveBeenCalledTimes(1);

            expect(mailService.sendRecoveryCode).toHaveBeenCalledWith(mockUser.email, '550000');
            expect(mailService.sendRecoveryCode).toHaveBeenCalledTimes(1);

            jest.restoreAllMocks();
        });

        it('should throw NotFoundException when user does not exist', async () => {
            const email = 'nonexistent@example.com';
            userService.findByEmail.mockResolvedValue(null);

            await expect(service.recoverPassword(email)).rejects.toThrow(
                new NotFoundException(`User with email ${email} not found`)
            );

            expect(userService.findByEmail).toHaveBeenCalledWith(email);
            expect(passwordRecoveryRepository.delete).not.toHaveBeenCalled();
            expect(passwordRecoveryRepository.recoverPassword).not.toHaveBeenCalled();
            expect(mailService.sendRecoveryCode).not.toHaveBeenCalled();
        });

        it('should generate a 6-digit recovery code', async () => {
            const email = 'test@example.com';
            userService.findByEmail.mockResolvedValue(mockUser);
            passwordRecoveryRepository.delete.mockResolvedValue();
            passwordRecoveryRepository.recoverPassword.mockResolvedValue();
            mailService.sendRecoveryCode.mockResolvedValue();

            await service.recoverPassword(email);

            const recoverPasswordCall = passwordRecoveryRepository.recoverPassword.mock.calls[0];
            const generatedCode = recoverPasswordCall[0];

            expect(generatedCode).toMatch(/^\d{6}$/);
            expect(parseInt(generatedCode)).toBeGreaterThanOrEqual(100000);
            expect(parseInt(generatedCode)).toBeLessThanOrEqual(999999);
        });

        it('should set expiration time to 5 minutes from now', async () => {
            const email = 'test@example.com';
            const currentTime = new Date('2024-01-01T12:00:00.000Z');
            jest.useFakeTimers();
            jest.setSystemTime(currentTime);

            userService.findByEmail.mockResolvedValue(mockUser);
            passwordRecoveryRepository.delete.mockResolvedValue();
            passwordRecoveryRepository.recoverPassword.mockResolvedValue();
            mailService.sendRecoveryCode.mockResolvedValue();

            await service.recoverPassword(email);

            const recoverPasswordCall = passwordRecoveryRepository.recoverPassword.mock.calls[0];
            const expirationDate = recoverPasswordCall[1];

            const expectedExpiration = new Date(currentTime.getTime() + 5 * 60 * 1000);
            expect(expirationDate).toEqual(expectedExpiration);

            jest.useRealTimers();
        });

        it('should handle error when deleting existing codes fails', async () => {
            const email = 'test@example.com';
            const error = new Error('Delete error');

            userService.findByEmail.mockResolvedValue(mockUser);
            passwordRecoveryRepository.delete.mockRejectedValue(error);

            await expect(service.recoverPassword(email)).rejects.toThrow('Delete error');

            expect(passwordRecoveryRepository.recoverPassword).not.toHaveBeenCalled();
            expect(mailService.sendRecoveryCode).not.toHaveBeenCalled();
        });
    });

    describe('verifyRecoveryCode', () => {
        const verifyData = {
            email: 'test@example.com',
            code: '123456',
        };

        it('should verify recovery code successfully', async () => {
            userService.findByEmail.mockResolvedValue(mockUser);
            passwordRecoveryRepository.findByRecoveryCode.mockResolvedValue(true);

            await service.verifyRecoveryCode(verifyData);

            expect(userService.findByEmail).toHaveBeenCalledWith(verifyData.email);
            expect(passwordRecoveryRepository.findByRecoveryCode).toHaveBeenCalledWith(
                verifyData.code,
                mockUser.id
            );
        });

        it('should throw NotFoundException when user does not exist', async () => {
            userService.findByEmail.mockResolvedValue(null);

            await expect(service.verifyRecoveryCode(verifyData)).rejects.toThrow(
                new NotFoundException(`User with email ${verifyData.email} not found`)
            );

            expect(passwordRecoveryRepository.findByRecoveryCode).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException when recovery code is not found', async () => {
            userService.findByEmail.mockResolvedValue(mockUser);
            passwordRecoveryRepository.findByRecoveryCode.mockResolvedValue(false);

            await expect(service.verifyRecoveryCode(verifyData)).rejects.toThrow(
                new NotFoundException(`Recovery code ${verifyData.code} not found`)
            );
        });

        it('should throw NotFoundException when recovery code returns null', async () => {
            userService.findByEmail.mockResolvedValue(mockUser);
            passwordRecoveryRepository.findByRecoveryCode.mockResolvedValue(null as any);

            await expect(service.verifyRecoveryCode(verifyData)).rejects.toThrow(
                new NotFoundException(`Recovery code ${verifyData.code} not found`)
            );
        });
    });

    describe('resetPassword', () => {
        const resetData = {
            email: 'test@example.com',
            password: 'newPassword123',
        };

        it('should reset password successfully', async () => {
            const hashedNewPassword = '$2b$12$newHashedPassword';
            userService.findByEmail.mockResolvedValue(mockUser);
            mockedBcrypt.hashSync.mockReturnValue(hashedNewPassword);
            userService.update.mockResolvedValue({
                id: mockUser.id,
                password: hashedNewPassword
            } as User);
            passwordRecoveryRepository.delete.mockResolvedValue();

            await service.resetPassword(resetData);

            expect(userService.findByEmail).toHaveBeenCalledWith(resetData.email);
            expect(mockedBcrypt.hashSync).toHaveBeenCalledWith(resetData.password, 12);
            expect(userService.update).toHaveBeenCalledWith(mockUser.id, {
                password: hashedNewPassword
            });
            expect(passwordRecoveryRepository.delete).toHaveBeenCalledWith(mockUser.id);
        });

        it('should throw NotFoundException when user does not exist', async () => {
            userService.findByEmail.mockResolvedValue(null);

            await expect(service.resetPassword(resetData)).rejects.toThrow(
                new NotFoundException(`User with email ${resetData.email} not found`)
            );

            expect(mockedBcrypt.hashSync).not.toHaveBeenCalled();
            expect(userService.update).not.toHaveBeenCalled();
            expect(passwordRecoveryRepository.delete).not.toHaveBeenCalled();
        });

        it('should handle error when updating user password fails', async () => {
            const error = new Error('Update error');
            userService.findByEmail.mockResolvedValue(mockUser);
            mockedBcrypt.hashSync.mockReturnValue('$2b$12$newHashedPassword');
            userService.update.mockRejectedValue(error);

            await expect(service.resetPassword(resetData)).rejects.toThrow('Update error');

            expect(passwordRecoveryRepository.delete).not.toHaveBeenCalled();
        });

        it('should handle error when deleting recovery codes fails', async () => {
            const error = new Error('Delete error');
            userService.findByEmail.mockResolvedValue(mockUser);
            mockedBcrypt.hashSync.mockReturnValue('$2b$12$newHashedPassword');
            userService.update.mockResolvedValue({
                id: mockUser.id,
                password: '$2b$12$newHashedPassword'
            } as User);
            passwordRecoveryRepository.delete.mockRejectedValue(error);

            await expect(service.resetPassword(resetData)).rejects.toThrow('Delete error');
        });
    });

    describe('Integration scenarios', () => {
        it('should complete full password recovery flow', async () => {
            const email = 'integration@test.com';
            const code = '123456';
            const newPassword = 'newSecurePassword123';

            userService.findByEmail.mockResolvedValue(mockUser);
            passwordRecoveryRepository.delete.mockResolvedValue();
            passwordRecoveryRepository.recoverPassword.mockResolvedValue();
            mailService.sendRecoveryCode.mockResolvedValue();
            passwordRecoveryRepository.findByRecoveryCode.mockResolvedValue(true);
            userService.update.mockResolvedValue({
                id: mockUser.id,
                password: '$2b$12$newHashedPassword'
            } as User);
            mockedBcrypt.hashSync.mockReturnValue('$2b$12$newHashedPassword');

            await service.recoverPassword(email);
            expect(userService.findByEmail).toHaveBeenCalledWith(email);
            expect(passwordRecoveryRepository.delete).toHaveBeenCalledWith(mockUser.id);
            expect(passwordRecoveryRepository.recoverPassword).toHaveBeenCalled();
            expect(mailService.sendRecoveryCode).toHaveBeenCalled();

            await service.verifyRecoveryCode({ email, code });
            expect(passwordRecoveryRepository.findByRecoveryCode).toHaveBeenCalledWith(code, mockUser.id);

            await service.resetPassword({ email, password: newPassword });
            expect(mockedBcrypt.hashSync).toHaveBeenCalledWith(newPassword, 12);
            expect(userService.update).toHaveBeenCalledWith(mockUser.id, {
                password: '$2b$12$newHashedPassword'
            });
            expect(passwordRecoveryRepository.delete).toHaveBeenCalledWith(mockUser.id);
        });
    });
});