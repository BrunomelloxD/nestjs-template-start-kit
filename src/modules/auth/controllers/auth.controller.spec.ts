import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from '../services/auth.service';
import { PasswordService } from '../services/password.service';
import { LoginUserDto } from '../dtos/login-user.dto';
import { RecoveryPasswordDto } from '../dtos/recovery-password.dto';
import { VerifyRecoveryCodeDto } from '../dtos/verify-recovery-code.dto';
import { ResetPasswordDto } from '../dtos/reset-password.dto';
import { AuthResponse } from '../types/auth.types';

describe('AuthController', () => {
    let controller: AuthController;
    let authService: jest.Mocked<AuthService>;
    let passwordService: jest.Mocked<PasswordService>;

    const mockAuthService = {
        signIn: jest.fn(),
    };

    const mockPasswordService = {
        recoverPassword: jest.fn(),
        verifyRecoveryCode: jest.fn(),
        resetPassword: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
                {
                    provide: PasswordService,
                    useValue: mockPasswordService,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get(AuthService);
        passwordService = module.get(PasswordService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('signIn', () => {
        const loginDto: LoginUserDto = {
            email: 'test@example.com',
            password: 'password123',
        };

        const mockAuthResponse: AuthResponse = {
            access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            user: {
                name: 'Test User',
                email: 'test@example.com',
            },
        };

        it('should login user successfully', async () => {
            authService.signIn.mockResolvedValue(mockAuthResponse);

            const result = await controller.signIn(loginDto);

            expect(result).toEqual(mockAuthResponse);
            expect(authService.signIn).toHaveBeenCalledWith(loginDto);
            expect(authService.signIn).toHaveBeenCalledTimes(1);
        });

        it('should throw UnauthorizedException for invalid credentials', async () => {
            const invalidCredentialsError = new UnauthorizedException('Password does not match.');
            authService.signIn.mockRejectedValue(invalidCredentialsError);

            await expect(controller.signIn(loginDto)).rejects.toThrow(
                new UnauthorizedException('Password does not match.')
            );

            expect(authService.signIn).toHaveBeenCalledWith(loginDto);
            expect(authService.signIn).toHaveBeenCalledTimes(1);
        });

        it('should throw NotFoundException when user does not exist', async () => {
            const userNotFoundError = new NotFoundException(`User with email ${loginDto.email} does not exists.`);
            authService.signIn.mockRejectedValue(userNotFoundError);

            await expect(controller.signIn(loginDto)).rejects.toThrow(userNotFoundError);

            expect(authService.signIn).toHaveBeenCalledWith(loginDto);
            expect(authService.signIn).toHaveBeenCalledTimes(1);
        });

        it('should throw UnauthorizedException when email is not verified', async () => {
            const emailNotVerifiedError = new UnauthorizedException(`Email not verified for user ${loginDto.email}.`);
            authService.signIn.mockRejectedValue(emailNotVerifiedError);

            await expect(controller.signIn(loginDto)).rejects.toThrow(emailNotVerifiedError);

            expect(authService.signIn).toHaveBeenCalledWith(loginDto);
            expect(authService.signIn).toHaveBeenCalledTimes(1);
        });

        it('should handle service errors', async () => {
            const serviceError = new Error('Internal server error');
            authService.signIn.mockRejectedValue(serviceError);

            await expect(controller.signIn(loginDto)).rejects.toThrow('Internal server error');

            expect(authService.signIn).toHaveBeenCalledWith(loginDto);
            expect(authService.signIn).toHaveBeenCalledTimes(1);
        });

        it('should pass correct DTO to service', async () => {
            const specificLoginDto: LoginUserDto = {
                email: 'specific@test.com',
                password: 'specificPassword123',
            };

            authService.signIn.mockResolvedValue(mockAuthResponse);

            await controller.signIn(specificLoginDto);

            expect(authService.signIn).toHaveBeenCalledWith(specificLoginDto);
            expect(authService.signIn).not.toHaveBeenCalledWith(loginDto);
        });
    });

    describe('recoverPassword', () => {
        const recoveryDto: RecoveryPasswordDto = {
            email: 'test@example.com',
        };

        it('should request password recovery successfully', async () => {
            passwordService.recoverPassword.mockResolvedValue();

            const result = await controller.recoverPassword(recoveryDto);

            expect(result).toBeUndefined();
            expect(passwordService.recoverPassword).toHaveBeenCalledWith(recoveryDto.email);
            expect(passwordService.recoverPassword).toHaveBeenCalledTimes(1);
        });

        it('should throw NotFoundException when user email does not exist', async () => {
            const userNotFoundError = new NotFoundException(`User with email ${recoveryDto.email} not found`);
            passwordService.recoverPassword.mockRejectedValue(userNotFoundError);

            await expect(controller.recoverPassword(recoveryDto)).rejects.toThrow(userNotFoundError);

            expect(passwordService.recoverPassword).toHaveBeenCalledWith(recoveryDto.email);
            expect(passwordService.recoverPassword).toHaveBeenCalledTimes(1);
        });

        it('should handle email service errors', async () => {
            const emailError = new Error('Failed to send email');
            passwordService.recoverPassword.mockRejectedValue(emailError);

            await expect(controller.recoverPassword(recoveryDto)).rejects.toThrow('Failed to send email');

            expect(passwordService.recoverPassword).toHaveBeenCalledWith(recoveryDto.email);
            expect(passwordService.recoverPassword).toHaveBeenCalledTimes(1);
        });

        it('should extract email from DTO correctly', async () => {
            const differentRecoveryDto: RecoveryPasswordDto = {
                email: 'different@example.com',
            };

            passwordService.recoverPassword.mockResolvedValue();

            await controller.recoverPassword(differentRecoveryDto);

            expect(passwordService.recoverPassword).toHaveBeenCalledWith(differentRecoveryDto.email);
            expect(passwordService.recoverPassword).not.toHaveBeenCalledWith(recoveryDto.email);
        });
    });

    describe('verifyRecoveryCode', () => {
        const verifyCodeDto: VerifyRecoveryCodeDto = {
            email: 'test@example.com',
            code: '123456',
        };

        it('should verify recovery code successfully', async () => {
            passwordService.verifyRecoveryCode.mockResolvedValue();

            const result = await controller.verifyRecoveryCode(verifyCodeDto);

            expect(result).toBeUndefined();
            expect(passwordService.verifyRecoveryCode).toHaveBeenCalledWith(verifyCodeDto);
            expect(passwordService.verifyRecoveryCode).toHaveBeenCalledTimes(1);
        });

        it('should throw NotFoundException when user does not exist', async () => {
            const userNotFoundError = new NotFoundException(`User with email ${verifyCodeDto.email} not found`);
            passwordService.verifyRecoveryCode.mockRejectedValue(userNotFoundError);

            await expect(controller.verifyRecoveryCode(verifyCodeDto)).rejects.toThrow(userNotFoundError);

            expect(passwordService.verifyRecoveryCode).toHaveBeenCalledWith(verifyCodeDto);
            expect(passwordService.verifyRecoveryCode).toHaveBeenCalledTimes(1);
        });

        it('should throw NotFoundException when recovery code is invalid', async () => {
            const invalidCodeError = new NotFoundException(`Recovery code ${verifyCodeDto.code} not found`);
            passwordService.verifyRecoveryCode.mockRejectedValue(invalidCodeError);

            await expect(controller.verifyRecoveryCode(verifyCodeDto)).rejects.toThrow(invalidCodeError);

            expect(passwordService.verifyRecoveryCode).toHaveBeenCalledWith(verifyCodeDto);
            expect(passwordService.verifyRecoveryCode).toHaveBeenCalledTimes(1);
        });

        it('should pass complete DTO to service', async () => {
            const completeVerifyDto: VerifyRecoveryCodeDto = {
                email: 'complete@test.com',
                code: '654321',
            };

            passwordService.verifyRecoveryCode.mockResolvedValue();

            await controller.verifyRecoveryCode(completeVerifyDto);

            expect(passwordService.verifyRecoveryCode).toHaveBeenCalledWith(completeVerifyDto);
            expect(passwordService.verifyRecoveryCode).not.toHaveBeenCalledWith(verifyCodeDto);
        });

        it('should handle service errors during verification', async () => {
            const serviceError = new Error('Database connection failed');
            passwordService.verifyRecoveryCode.mockRejectedValue(serviceError);

            await expect(controller.verifyRecoveryCode(verifyCodeDto)).rejects.toThrow('Database connection failed');

            expect(passwordService.verifyRecoveryCode).toHaveBeenCalledWith(verifyCodeDto);
            expect(passwordService.verifyRecoveryCode).toHaveBeenCalledTimes(1);
        });
    });

    describe('resetPassword', () => {
        const resetPasswordDto: ResetPasswordDto = {
            email: 'test@example.com',
            password: 'newPassword123',
        };

        it('should reset password successfully', async () => {
            passwordService.resetPassword.mockResolvedValue();

            const result = await controller.resetPassword(resetPasswordDto);

            expect(result).toBeUndefined();
            expect(passwordService.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
            expect(passwordService.resetPassword).toHaveBeenCalledTimes(1);
        });

        it('should throw NotFoundException when user does not exist', async () => {
            const userNotFoundError = new NotFoundException(`User with email ${resetPasswordDto.email} not found`);
            passwordService.resetPassword.mockRejectedValue(userNotFoundError);

            await expect(controller.resetPassword(resetPasswordDto)).rejects.toThrow(userNotFoundError);

            expect(passwordService.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
            expect(passwordService.resetPassword).toHaveBeenCalledTimes(1);
        });

        it('should handle password hashing errors', async () => {
            const hashError = new Error('Password hashing failed');
            passwordService.resetPassword.mockRejectedValue(hashError);

            await expect(controller.resetPassword(resetPasswordDto)).rejects.toThrow('Password hashing failed');

            expect(passwordService.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
            expect(passwordService.resetPassword).toHaveBeenCalledTimes(1);
        });

        it('should handle database update errors', async () => {
            const updateError = new Error('Failed to update user password');
            passwordService.resetPassword.mockRejectedValue(updateError);

            await expect(controller.resetPassword(resetPasswordDto)).rejects.toThrow('Failed to update user password');

            expect(passwordService.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
            expect(passwordService.resetPassword).toHaveBeenCalledTimes(1);
        });

        it('should pass complete DTO to service', async () => {
            const differentResetDto: ResetPasswordDto = {
                email: 'different@test.com',
                password: 'differentNewPassword456',
            };

            passwordService.resetPassword.mockResolvedValue();

            await controller.resetPassword(differentResetDto);

            expect(passwordService.resetPassword).toHaveBeenCalledWith(differentResetDto);
            expect(passwordService.resetPassword).not.toHaveBeenCalledWith(resetPasswordDto);
        });

        it('should handle password validation errors', async () => {
            const validationError = new Error('Password does not meet requirements');
            passwordService.resetPassword.mockRejectedValue(validationError);

            await expect(controller.resetPassword(resetPasswordDto)).rejects.toThrow('Password does not meet requirements');

            expect(passwordService.resetPassword).toHaveBeenCalledWith(resetPasswordDto);
            expect(passwordService.resetPassword).toHaveBeenCalledTimes(1);
        });
    });

    describe('Controller integration scenarios', () => {
        it('should handle complete password recovery flow', async () => {
            const email = 'integration@test.com';
            const code = '123456';
            const newPassword = 'newSecurePassword123';

            const recoveryDto: RecoveryPasswordDto = { email };
            const verifyDto: VerifyRecoveryCodeDto = { email, code };
            const resetDto: ResetPasswordDto = { email, password: newPassword };

            passwordService.recoverPassword.mockResolvedValue();
            passwordService.verifyRecoveryCode.mockResolvedValue();
            passwordService.resetPassword.mockResolvedValue();

            await controller.recoverPassword(recoveryDto);
            expect(passwordService.recoverPassword).toHaveBeenCalledWith(email);

            await controller.verifyRecoveryCode(verifyDto);
            expect(passwordService.verifyRecoveryCode).toHaveBeenCalledWith(verifyDto);

            await controller.resetPassword(resetDto);
            expect(passwordService.resetPassword).toHaveBeenCalledWith(resetDto);

            expect(passwordService.recoverPassword).toHaveBeenCalledTimes(1);
            expect(passwordService.verifyRecoveryCode).toHaveBeenCalledTimes(1);
            expect(passwordService.resetPassword).toHaveBeenCalledTimes(1);
        });

        it('should handle login after password reset', async () => {
            const email = 'user@test.com';
            const newPassword = 'resetPassword123';

            const resetDto: ResetPasswordDto = { email, password: newPassword };
            const loginDto: LoginUserDto = { email, password: newPassword };

            const mockAuthResponse: AuthResponse = {
                access_token: 'new-jwt-token',
                user: { name: 'Test User', email },
            };

            passwordService.resetPassword.mockResolvedValue();
            authService.signIn.mockResolvedValue(mockAuthResponse);

            await controller.resetPassword(resetDto);
            expect(passwordService.resetPassword).toHaveBeenCalledWith(resetDto);

            const loginResult = await controller.signIn(loginDto);
            expect(loginResult).toEqual(mockAuthResponse);
            expect(authService.signIn).toHaveBeenCalledWith(loginDto);
        });
    });

    describe('Error handling consistency', () => {
        it('should maintain consistent error responses across all endpoints', async () => {
            const notFoundError = new NotFoundException('User not found');

            const loginDto: LoginUserDto = { email: 'test@example.com', password: 'password' };
            const recoveryDto: RecoveryPasswordDto = { email: 'test@example.com' };
            const verifyDto: VerifyRecoveryCodeDto = { email: 'test@example.com', code: '123456' };
            const resetDto: ResetPasswordDto = { email: 'test@example.com', password: 'newPassword' };

            authService.signIn.mockRejectedValue(notFoundError);
            passwordService.recoverPassword.mockRejectedValue(notFoundError);
            passwordService.verifyRecoveryCode.mockRejectedValue(notFoundError);
            passwordService.resetPassword.mockRejectedValue(notFoundError);

            await expect(controller.signIn(loginDto)).rejects.toThrow(notFoundError);
            await expect(controller.recoverPassword(recoveryDto)).rejects.toThrow(notFoundError);
            await expect(controller.verifyRecoveryCode(verifyDto)).rejects.toThrow(notFoundError);
            await expect(controller.resetPassword(resetDto)).rejects.toThrow(notFoundError);
        });
    });

    describe('DTO validation', () => {
        it('should handle empty or invalid DTOs', async () => {
            const emptyLoginDto = {} as LoginUserDto;
            const emptyRecoveryDto = {} as RecoveryPasswordDto;

            authService.signIn.mockResolvedValue({} as AuthResponse);
            passwordService.recoverPassword.mockResolvedValue();

            await controller.signIn(emptyLoginDto);
            expect(authService.signIn).toHaveBeenCalledWith(emptyLoginDto);

            await controller.recoverPassword(emptyRecoveryDto);
            expect(passwordService.recoverPassword).toHaveBeenCalledWith(undefined);
        });
    });
});