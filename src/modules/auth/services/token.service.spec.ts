import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { JwtPayload } from '../types/auth.types';
import { User } from 'generated/prisma';

jest.mock('../../../common/config/env.config', () => ({
    security: {
        jwt: {
            secret: 'test-jwt-secret-key',
            expiresIn: '1h'
        }
    }
}));

describe('TokenService', () => {
    let service: TokenService;
    let jwtService: jest.Mocked<JwtService>;

    const mockJwtService = {
        sign: jest.fn(),
        verify: jest.fn(),
    };

    const mockUser: User = {
        id: 'user-123',
        name: 'Test User',
        email: 'test@example.com',
        password: '$2b$12$hashedPassword',
        email_verified: true,
        created_at: new Date('2024-01-01T00:00:00.000Z'),
        updated_at: new Date('2024-01-01T00:00:00.000Z'),
        deleted_at: null,
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TokenService,
                {
                    provide: JwtService,
                    useValue: mockJwtService,
                },
            ],
        }).compile();

        service = module.get<TokenService>(TokenService);
        jwtService = module.get(JwtService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('generateAccessToken', () => {
        it('should generate access token successfully', async () => {
            const expectedToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
            const expectedPayload: JwtPayload = {
                sub: mockUser.id,
                email: mockUser.email,
            };

            jwtService.sign.mockReturnValue(expectedToken);

            const result = await service.generateAccessToken(mockUser);

            expect(result).toBe(expectedToken);
            expect(jwtService.sign).toHaveBeenCalledWith(expectedPayload, {
                secret: 'test-jwt-secret-key',
                expiresIn: '1h',
            });
            expect(jwtService.sign).toHaveBeenCalledTimes(1);
        });

        it('should create correct payload for JWT token', async () => {
            const expectedToken = 'mock-jwt-token';
            jwtService.sign.mockReturnValue(expectedToken);

            await service.generateAccessToken(mockUser);

            const actualPayload = jwtService.sign.mock.calls[0][0];
            expect(actualPayload).toEqual({
                sub: mockUser.id,
                email: mockUser.email,
            });

            expect(actualPayload).not.toHaveProperty('password');
            expect(actualPayload).not.toHaveProperty('name');
            expect(actualPayload).not.toHaveProperty('created_at');
            expect(actualPayload).not.toHaveProperty('updated_at');
            expect(actualPayload).not.toHaveProperty('email_verified');
        });

        it('should use correct JWT configuration', async () => {
            const expectedToken = 'mock-jwt-token';
            jwtService.sign.mockReturnValue(expectedToken);

            await service.generateAccessToken(mockUser);

            const jwtOptions = jwtService.sign.mock.calls[0][1];
            expect(jwtOptions).toEqual({
                secret: 'test-jwt-secret-key',
                expiresIn: '1h',
            });
        });

        it('should handle different user data correctly', async () => {
            const differentUser: User = {
                id: 'user-456',
                name: 'Another User',
                email: 'another@example.com',
                password: '$2b$12$anotherHashedPassword',
                email_verified: false,
                created_at: new Date('2024-02-01T00:00:00.000Z'),
                updated_at: new Date('2024-02-01T00:00:00.000Z'),
                deleted_at: null,
            };

            const expectedToken = 'another-mock-jwt-token';
            jwtService.sign.mockReturnValue(expectedToken);

            const result = await service.generateAccessToken(differentUser);

            expect(result).toBe(expectedToken);

            const actualPayload = jwtService.sign.mock.calls[0][0];
            expect(actualPayload).toEqual({
                sub: differentUser.id,
                email: differentUser.email,
            });
        });

        it('should handle JwtService.sign throwing an error', async () => {
            const error = new Error('JWT signing failed');
            jwtService.sign.mockImplementation(() => {
                throw error;
            });

            await expect(service.generateAccessToken(mockUser)).rejects.toThrow('JWT signing failed');
            expect(jwtService.sign).toHaveBeenCalledTimes(1);
        });

        it('should handle user with null/undefined properties', async () => {
            const userWithNullProps: User = {
                id: 'user-null',
                name: 'Null User',
                email: 'null@example.com',
                password: null as any,
                email_verified: null as any,
                created_at: null as any,
                updated_at: null as any,
                deleted_at: null as any,
            };

            const expectedToken = 'null-user-token';
            jwtService.sign.mockReturnValue(expectedToken);

            const result = await service.generateAccessToken(userWithNullProps);

            expect(result).toBe(expectedToken);

            const actualPayload = jwtService.sign.mock.calls[0][0];
            expect(actualPayload).toEqual({
                sub: userWithNullProps.id,
                email: userWithNullProps.email,
            });
        });
    });

    describe('verifyToken', () => {
        it('should verify token successfully', async () => {
            const token = 'valid-jwt-token';
            const expectedPayload: JwtPayload = {
                sub: 'user-123',
                email: 'test@example.com',
            };

            jwtService.verify.mockResolvedValueOnce(expectedPayload as never);

            const result = await service.verifyToken(token);

            expect(result).toEqual(expectedPayload);
            expect(jwtService.verify).toHaveBeenCalledWith(token, {
                secret: 'test-jwt-secret-key',
            });
            expect(jwtService.verify).toHaveBeenCalledTimes(1);
        });

        it('should use correct JWT secret for verification', async () => {
            const token = 'test-token';
            const mockPayload: JwtPayload = { sub: 'user-123', email: 'test@example.com' };
            jwtService.verify.mockResolvedValue(mockPayload as never);

            await service.verifyToken(token);

            const verifyOptions = jwtService.verify.mock.calls[0][1];
            expect(verifyOptions).toEqual({
                secret: 'test-jwt-secret-key',
            });
        });

        it('should handle invalid token', async () => {
            const invalidToken = 'invalid-jwt-token';
            const error = new Error('Invalid token');
            jwtService.verify.mockRejectedValue(error as never);

            await expect(service.verifyToken(invalidToken)).rejects.toThrow('Invalid token');
            expect(jwtService.verify).toHaveBeenCalledWith(invalidToken, {
                secret: 'test-jwt-secret-key',
            });
            expect(jwtService.verify).toHaveBeenCalledTimes(1);
        });

        it('should handle expired token', async () => {
            const expiredToken = 'expired-jwt-token';
            const error = new Error('Token expired');
            error.name = 'TokenExpiredError';
            jwtService.verify.mockRejectedValue(error as never);

            await expect(service.verifyToken(expiredToken)).rejects.toThrow('Token expired');
            expect(jwtService.verify).toHaveBeenCalledTimes(1);
        });

        it('should handle malformed token', async () => {
            const malformedToken = 'malformed.jwt.token';
            const error = new Error('Malformed token');
            error.name = 'JsonWebTokenError';
            jwtService.verify.mockRejectedValue(error as never);

            await expect(service.verifyToken(malformedToken)).rejects.toThrow('Malformed token');
            expect(jwtService.verify).toHaveBeenCalledTimes(1);
        });

        it('should handle empty token', async () => {
            const emptyToken = '';
            const error = new Error('No token provided');
            jwtService.verify.mockRejectedValue(error as never);

            await expect(service.verifyToken(emptyToken)).rejects.toThrow('No token provided');
            expect(jwtService.verify).toHaveBeenCalledWith('', {
                secret: 'test-jwt-secret-key',
            });
        });

        it('should return payload with correct structure', async () => {
            const token = 'valid-token';
            const mockPayload: JwtPayload = {
                sub: 'user-456',
                email: 'user456@example.com',
            };

            jwtService.verify.mockResolvedValue(mockPayload as never);

            const result = await service.verifyToken(token);

            expect(result).toHaveProperty('sub');
            expect(result).toHaveProperty('email');
            expect(result.sub).toBe('user-456');
            expect(result.email).toBe('user456@example.com');
        });
    });

    describe('createPayload (private method via generateAccessToken)', () => {
        it('should create payload with only necessary user data', async () => {
            const userWithExtraData: User = {
                id: 'test-user-id',
                name: 'Test User Name',
                email: 'payload@test.com',
                password: 'should-not-be-in-payload',
                email_verified: true,
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null,
            };

            jwtService.sign.mockReturnValue('test-token');

            await service.generateAccessToken(userWithExtraData);

            const createdPayload = jwtService.sign.mock.calls[0][0] as { sub: string; email: string };

            expect(Object.keys(createdPayload)).toEqual(['sub', 'email']);
            expect(createdPayload.sub).toBe(userWithExtraData.id);
            expect(createdPayload.email).toBe(userWithExtraData.email);
        });
    });

    describe('Integration scenarios', () => {
        it('should complete token generation and verification cycle', async () => {
            const user: User = {
                id: 'integration-user',
                name: 'Integration Test',
                email: 'integration@test.com',
                password: '$2b$12$hash',
                email_verified: true,
                created_at: new Date(),
                updated_at: new Date(),
                deleted_at: null,
            };

            const generatedToken = 'integration-test-token';
            const expectedPayload: JwtPayload = {
                sub: user.id,
                email: user.email,
            };

            jwtService.sign.mockReturnValue(generatedToken);

            jwtService.verify.mockResolvedValue(expectedPayload as never);

            const token = await service.generateAccessToken(user);
            expect(token).toBe(generatedToken);

            const verifiedPayload = await service.verifyToken(token);

            expect(verifiedPayload).toEqual(expectedPayload);
            expect(jwtService.sign).toHaveBeenCalledTimes(1);
            expect(jwtService.verify).toHaveBeenCalledTimes(1);
        });

        it('should handle full authentication flow with different users', async () => {
            const users: User[] = [
                {
                    id: 'user-1',
                    name: 'User One',
                    email: 'user1@test.com',
                    password: '$2b$12$hash1',
                    email_verified: true,
                    created_at: new Date(),
                    updated_at: new Date(),
                    deleted_at: null,
                },
                {
                    id: 'user-2',
                    name: 'User Two',
                    email: 'user2@test.com',
                    password: '$2b$12$hash2',
                    email_verified: false,
                    created_at: new Date(),
                    updated_at: new Date(),
                    deleted_at: null,
                },
            ];

            for (let i = 0; i < users.length; i++) {
                const user = users[i];
                const expectedToken = `token-${i + 1}`;
                const expectedPayload: JwtPayload = {
                    sub: user.id,
                    email: user.email,
                };

                jwtService.sign.mockReturnValue(expectedToken);
                jwtService.verify.mockResolvedValue(expectedPayload as never);

                const token = await service.generateAccessToken(user);
                const payload = await service.verifyToken(token);

                expect(token).toBe(expectedToken);
                expect(payload).toEqual(expectedPayload);
            }

            expect(jwtService.sign).toHaveBeenCalledTimes(users.length);
            expect(jwtService.verify).toHaveBeenCalledTimes(users.length);
        });
    });
});