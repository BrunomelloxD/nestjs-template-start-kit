import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserService } from './user.service';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../repositories/user.repository';

jest.mock('bcrypt', () => ({
    hash: jest.fn(),
}));

jest.mock('src/common/config/env.config', () => ({
    security: {
        bcrypt: {
            saltRounds: 10
        }
    }
}));

describe('UserService', () => {
    let service: UserService;
    let userRepository: UserRepository;
    let bcryptMock: jest.Mocked<typeof bcrypt>;

    const mockUserRepository = {
        findOne: jest.fn(),
        findAll: jest.fn(),
        create: jest.fn(),
        remove: jest.fn(),
        existsByEmail: jest.fn(),
        existsById: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserService,
                {
                    provide: UserRepository,
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        service = module.get<UserService>(UserService);
        userRepository = module.get<UserRepository>(UserRepository);
        bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

        jest.clearAllMocks();
    });

    describe('findOne', () => {
        const mockUser = {
            id: '1',
            name: 'Bruno',
            email: 'bruno@example.com',
            created_at: new Date(),
            updated_at: new Date()
        };

        it('should return a user when exists', async () => {
            mockUserRepository.existsById.mockResolvedValue(true);
            mockUserRepository.findOne.mockResolvedValue(mockUser);

            const result = await service.findOne('1');

            expect(mockUserRepository.existsById).toHaveBeenCalledWith('1', true);
            expect(mockUserRepository.findOne).toHaveBeenCalledWith('1');
            expect(result).toEqual(mockUser);
        });

        it('should throw NotFoundException when user does not exist', async () => {
            mockUserRepository.existsById.mockResolvedValue(false);

            await expect(service.findOne('999')).rejects.toThrow(
                new NotFoundException('User with id 999 does not exists.')
            );

            expect(mockUserRepository.existsById).toHaveBeenCalledWith('999', true);
            expect(mockUserRepository.findOne).not.toHaveBeenCalled();
        });
    });

    describe('existsByEmail', () => {
        it('should return true when user exists with email', async () => {
            mockUserRepository.existsByEmail.mockResolvedValue(true);

            const result = await service.existsByEmail('bruno@example.com', true);

            expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith('bruno@example.com', true);
            expect(result).toBe(true);
        });

        it('should return false when user does not exist with email', async () => {
            mockUserRepository.existsByEmail.mockResolvedValue(false);

            const result = await service.existsByEmail('nonexistent@example.com');

            expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith('nonexistent@example.com', undefined);
            expect(result).toBe(false);
        });
    });

    describe('existById', () => {
        it('should return true when user exists with id', async () => {
            mockUserRepository.existsById.mockResolvedValue(true);

            const result = await service.existById('1', true);

            expect(mockUserRepository.existsById).toHaveBeenCalledWith('1', true);
            expect(result).toBe(true);
        });

        it('should return false when user does not exist with id', async () => {
            mockUserRepository.existsById.mockResolvedValue(false);

            const result = await service.existById('999');

            expect(mockUserRepository.existsById).toHaveBeenCalledWith('999', undefined);
            expect(result).toBe(false);
        });
    });

    describe('findAll', () => {
        it('should return paginated users', async () => {
            const mockPaginationDto = { page: 1, limit: 10 };
            const mockResult = {
                data: [
                    { id: '1', name: 'Bruno', email: 'bruno@example.com', created_at: new Date(), updated_at: new Date() }
                ],
                meta: { total: 1, page: 1, last_page: 1 }
            };

            mockUserRepository.findAll.mockResolvedValue(mockResult);

            const result = await service.findAll(mockPaginationDto);

            expect(mockUserRepository.findAll).toHaveBeenCalledWith(mockPaginationDto);
            expect(result).toEqual(mockResult);
        });
    });

    describe('create', () => {
        const mockCreateData = {
            name: 'Bruno',
            email: 'bruno@example.com',
            password: 'plainPassword123'
        };

        const mockCreatedUser = {
            id: '1',
            name: 'Bruno',
            email: 'bruno@example.com',
            created_at: new Date(),
            updated_at: new Date()
        };

        it('should create a user with hashed password', async () => {
            const hashedPassword = 'hashedPassword123';

            mockUserRepository.existsByEmail.mockResolvedValue(false);
            (bcryptMock.hash as jest.Mock).mockResolvedValue(hashedPassword);
            mockUserRepository.create.mockResolvedValue(mockCreatedUser);

            const result = await service.create(mockCreateData);

            expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith('bruno@example.com', false);
            expect(bcryptMock.hash).toHaveBeenCalledWith('plainPassword123', 10);
            expect(mockUserRepository.create).toHaveBeenCalledWith({
                ...mockCreateData,
                password: hashedPassword
            });
            expect(result).toEqual(mockCreatedUser);
        });

        it('should throw ConflictException when email already exists', async () => {
            mockUserRepository.existsByEmail.mockResolvedValue(true);

            await expect(service.create(mockCreateData)).rejects.toThrow(
                new ConflictException('User with email bruno@example.com already exists.')
            );

            expect(mockUserRepository.existsByEmail).toHaveBeenCalledWith('bruno@example.com', false);
            expect(bcryptMock.hash).not.toHaveBeenCalled();
            expect(mockUserRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('remove', () => {
        it('should remove a user when exists', async () => {
            mockUserRepository.existsById.mockResolvedValue(true);
            mockUserRepository.remove.mockResolvedValue(undefined);

            await service.remove('1');

            expect(mockUserRepository.existsById).toHaveBeenCalledWith('1', true);
            expect(mockUserRepository.remove).toHaveBeenCalledWith('1');
        });

        it('should throw NotFoundException when user does not exist', async () => {
            mockUserRepository.existsById.mockResolvedValue(false);

            await expect(service.remove('999')).rejects.toThrow(
                new NotFoundException('User with id 999 does not exists or is already deleted.')
            );

            expect(mockUserRepository.existsById).toHaveBeenCalledWith('999', true);
            expect(mockUserRepository.remove).not.toHaveBeenCalled();
        });

        it('should throw NotFoundException when user is already deleted', async () => {
            mockUserRepository.existsById.mockResolvedValue(false);

            await expect(service.remove('1')).rejects.toThrow(
                new NotFoundException('User with id 1 does not exists or is already deleted.')
            );

            expect(mockUserRepository.existsById).toHaveBeenCalledWith('1', true);
            expect(mockUserRepository.remove).not.toHaveBeenCalled();
        });
    });

    describe('edge cases and error scenarios', () => {
        it('should handle repository errors gracefully', async () => {
            const repositoryError = new Error('Database connection failed');
            mockUserRepository.findAll.mockRejectedValue(repositoryError);

            await expect(service.findAll({ page: 1, limit: 10 })).rejects.toThrow(repositoryError);
        });

        it('should handle bcrypt errors during user creation', async () => {
            const bcryptError = new Error('Hash generation failed');

            mockUserRepository.existsByEmail.mockResolvedValue(false);
            (bcryptMock.hash as jest.Mock).mockRejectedValue(bcryptError);

            await expect(service.create({
                name: 'Test',
                email: 'test@example.com',
                password: 'password123'
            })).rejects.toThrow(bcryptError);
        });
    });
});