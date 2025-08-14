import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/modules/users/services/user.service';
import { TokenService } from './token.service';
import { LoginUserDto } from '../dtos/login-user.dto';
import { AuthResponse } from '../types/auth.types';
import { User } from 'generated/prisma';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
    let service: AuthService;
    let userService: jest.Mocked<UserService>;
    let tokenService: jest.Mocked<TokenService>;

    const mockUserService = {
        findByEmail: jest.fn(),
    };

    const mockTokenService = {
        generateAccessToken: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
                {
                    provide: TokenService,
                    useValue: mockTokenService,
                },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        userService = module.get(UserService);
        tokenService = module.get(TokenService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('signIn', () => {
        const loginDto: LoginUserDto = {
            email: 'test@example.com',
            password: 'password123',
        };

        const mockUser: User = {
            id: 'user-123',
            name: 'Test User',
            email: 'test@example.com',
            password: '$2b$10$hashedPassword',
            email_verified: true,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
        };

        const mockAccessToken = 'mock-jwt-token';

        it('should successfully sign in a user with valid credentials', async () => {
            userService.findByEmail.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(true as never);
            tokenService.generateAccessToken.mockResolvedValue(mockAccessToken);

            const expectedResponse: AuthResponse = {
                access_token: mockAccessToken,
                user: {
                    name: mockUser.name,
                    email: mockUser.email,
                },
            };

            const result = await service.signIn(loginDto);

            expect(result).toEqual(expectedResponse);
            expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email, true);
            expect(userService.findByEmail).toHaveBeenCalledTimes(1);
            expect(mockedBcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
            expect(mockedBcrypt.compare).toHaveBeenCalledTimes(1);
            expect(tokenService.generateAccessToken).toHaveBeenCalledWith(mockUser);
            expect(tokenService.generateAccessToken).toHaveBeenCalledTimes(1);
        });

        it('should throw NotFoundException when user does not exist', async () => {
            userService.findByEmail.mockResolvedValue(null);

            await expect(service.signIn(loginDto)).rejects.toThrow(
                new NotFoundException(`User with email ${loginDto.email} does not exists.`)
            );

            expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email, true);
            expect(userService.findByEmail).toHaveBeenCalledTimes(1);
            expect(mockedBcrypt.compare).not.toHaveBeenCalled();
            expect(tokenService.generateAccessToken).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException when email is not verified', async () => {
            const unverifiedUser: User = {
                ...mockUser,
                email_verified: false,
            };

            userService.findByEmail.mockResolvedValue(unverifiedUser);

            await expect(service.signIn(loginDto)).rejects.toThrow(
                new UnauthorizedException(`Email not verified for user ${loginDto.email}.`)
            );

            expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email, true);
            expect(userService.findByEmail).toHaveBeenCalledTimes(1);
            expect(mockedBcrypt.compare).not.toHaveBeenCalled();
            expect(tokenService.generateAccessToken).not.toHaveBeenCalled();
        });

        it('should throw UnauthorizedException when password does not match', async () => {
            userService.findByEmail.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(false as never);

            await expect(service.signIn(loginDto)).rejects.toThrow(
                new UnauthorizedException('Password does not match.')
            );

            expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email, true);
            expect(userService.findByEmail).toHaveBeenCalledTimes(1);
            expect(mockedBcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
            expect(mockedBcrypt.compare).toHaveBeenCalledTimes(1);
            expect(tokenService.generateAccessToken).not.toHaveBeenCalled();
        });

        it('should handle userService.findByEmail throwing an error', async () => {
            const error = new Error('Database connection error');
            userService.findByEmail.mockRejectedValue(error);

            await expect(service.signIn(loginDto)).rejects.toThrow('Database connection error');

            expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email, true);
            expect(userService.findByEmail).toHaveBeenCalledTimes(1);
            expect(mockedBcrypt.compare).not.toHaveBeenCalled();
            expect(tokenService.generateAccessToken).not.toHaveBeenCalled();
        });

        it('should handle bcrypt.compare throwing an error', async () => {
            const error = new Error('Bcrypt error');
            userService.findByEmail.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockRejectedValue(error as never);

            await expect(service.signIn(loginDto)).rejects.toThrow('Bcrypt error');

            expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email, true);
            expect(userService.findByEmail).toHaveBeenCalledTimes(1);
            expect(mockedBcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
            expect(mockedBcrypt.compare).toHaveBeenCalledTimes(1);
            expect(tokenService.generateAccessToken).not.toHaveBeenCalled();
        });

        it('should handle tokenService.generateAccessToken throwing an error', async () => {
            const error = new Error('Token generation error');
            userService.findByEmail.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(true as never);
            tokenService.generateAccessToken.mockRejectedValue(error);

            await expect(service.signIn(loginDto)).rejects.toThrow('Token generation error');

            expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email, true);
            expect(userService.findByEmail).toHaveBeenCalledTimes(1);
            expect(mockedBcrypt.compare).toHaveBeenCalledWith(loginDto.password, mockUser.password);
            expect(mockedBcrypt.compare).toHaveBeenCalledTimes(1);
            expect(tokenService.generateAccessToken).toHaveBeenCalledWith(mockUser);
            expect(tokenService.generateAccessToken).toHaveBeenCalledTimes(1);
        });

        it('should pass correct parameters to userService.findByEmail', async () => {
            userService.findByEmail.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(true as never);
            tokenService.generateAccessToken.mockResolvedValue(mockAccessToken);

            await service.signIn(loginDto);

            expect(userService.findByEmail).toHaveBeenCalledWith(loginDto.email, true);
        });

        it('should return response with correct user data structure', async () => {
            const userWithExtraFields: User = {
                ...mockUser,
                password: '$2b$10$hashedPassword',
                created_at: new Date(),
                updated_at: new Date(),
            };

            userService.findByEmail.mockResolvedValue(userWithExtraFields);
            mockedBcrypt.compare.mockResolvedValue(true as never);
            tokenService.generateAccessToken.mockResolvedValue(mockAccessToken);

            const result = await service.signIn(loginDto);

            expect(result.user).toEqual({
                name: userWithExtraFields.name,
                email: userWithExtraFields.email,
            });

            expect(result.user).not.toHaveProperty('password');
            expect(result.user).not.toHaveProperty('id');
            expect(result.user).not.toHaveProperty('created_at');
            expect(result.user).not.toHaveProperty('updated_at');
        });

        it('should handle edge case with empty password', async () => {
            const loginDtoWithEmptyPassword: LoginUserDto = {
                email: 'test@example.com',
                password: '',
            };

            userService.findByEmail.mockResolvedValue(mockUser);
            mockedBcrypt.compare.mockResolvedValue(false as never);

            await expect(service.signIn(loginDtoWithEmptyPassword)).rejects.toThrow(
                new UnauthorizedException('Password does not match.')
            );

            expect(mockedBcrypt.compare).toHaveBeenCalledWith('', mockUser.password);
        });

        it('should handle edge case with null user password', async () => {
            const userWithNullPassword: User = {
                ...mockUser,
                password: null as any,
            };

            userService.findByEmail.mockResolvedValue(userWithNullPassword);
            mockedBcrypt.compare.mockResolvedValue(false as never);

            await expect(service.signIn(loginDto)).rejects.toThrow(
                new UnauthorizedException('Password does not match.')
            );

            expect(mockedBcrypt.compare).toHaveBeenCalledWith(loginDto.password, null);
        });
    });

    it('should call methods in correct order during authentication flow', async () => {
        const loginDto: LoginUserDto = {
            email: 'test@example.com',
            password: 'password123',
        };

        const mockUser: User = {
            id: 'user-123',
            name: 'Test User',
            email: 'test@example.com',
            password: '$2b$10$hashedPassword',
            email_verified: true,
            created_at: new Date(),
            updated_at: new Date(),
            deleted_at: null,
        };

        const mockToken = 'test-jwt-token';
        const callOrder: string[] = [];

        userService.findByEmail.mockImplementation(async (...args) => {
            callOrder.push('findByEmail');
            return mockUser;
        });

        mockedBcrypt.compare.mockImplementation(async (...args) => {
            callOrder.push('compare');
            return true as never;
        });

        tokenService.generateAccessToken.mockImplementation(async (...args) => {
            callOrder.push('generateAccessToken');
            return mockToken;
        });

        await service.signIn(loginDto);

        expect(callOrder).toEqual(['findByEmail', 'compare', 'generateAccessToken']);
    });
});