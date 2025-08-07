import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from '../services/user.service';

describe('UserController', () => {
    let controller: UserController;
    let userService: UserService;

    const mockUserService = {
        findAll: jest.fn(),
        findOne: jest.fn(),
        create: jest.fn(),
        remove: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [UserController],
            providers: [
                {
                    provide: UserService,
                    useValue: mockUserService,
                },
            ],
        }).compile();

        controller = module.get<UserController>(UserController);
        userService = module.get<UserService>(UserService);

        jest.clearAllMocks();
    });

    describe('findAll', () => {
        it('should return paginated users with default pagination', async () => {
            const mockPaginationDto = { page: 1, limit: 10 };
            const mockResult = {
                data: [
                    {
                        id: '1',
                        name: 'Bruno',
                        email: 'bruno@example.com',
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                ],
                meta: {
                    total: 1,
                    page: 1,
                    last_page: 1
                }
            };

            mockUserService.findAll.mockResolvedValue(mockResult);

            const result = await controller.findAll(mockPaginationDto);

            expect(mockUserService.findAll).toHaveBeenCalledWith(mockPaginationDto);
            expect(result).toEqual(mockResult);
        });

        it('should return paginated users with custom pagination', async () => {
            const mockPaginationDto = { page: 2, limit: 5 };
            const mockResult = {
                data: [
                    {
                        id: '6',
                        name: 'User 6',
                        email: 'user6@example.com',
                        created_at: new Date(),
                        updated_at: new Date()
                    }
                ],
                meta: {
                    total: 20,
                    page: 2,
                    last_page: 4
                }
            };

            mockUserService.findAll.mockResolvedValue(mockResult);

            const result = await controller.findAll(mockPaginationDto);

            expect(mockUserService.findAll).toHaveBeenCalledWith(mockPaginationDto);
            expect(result).toEqual(mockResult);
        });

        it('should return empty list when no users found', async () => {
            const mockPaginationDto = { page: 1, limit: 10 };
            const mockResult = {
                data: [],
                meta: {
                    total: 0,
                    page: 1,
                    last_page: 0
                }
            };

            mockUserService.findAll.mockResolvedValue(mockResult);

            const result = await controller.findAll(mockPaginationDto);

            expect(mockUserService.findAll).toHaveBeenCalledWith(mockPaginationDto);
            expect(result).toEqual(mockResult);
        });
    });

    describe('create', () => {
        const mockCreateUserDto = {
            name: 'Bruno',
            email: 'bruno@example.com',
            password: 'password123'
        };

        const mockCreatedUser = {
            id: '1',
            name: 'Bruno',
            email: 'bruno@example.com',
            created_at: new Date(),
            updated_at: new Date()
        };

        it('should create a user successfully', async () => {
            mockUserService.create.mockResolvedValue(mockCreatedUser);

            const result = await controller.create(mockCreateUserDto);

            expect(mockUserService.create).toHaveBeenCalledWith(mockCreateUserDto);
            expect(result).toEqual(mockCreatedUser);
        });

        it('should throw ConflictException when email already exists', async () => {
            const conflictError = new ConflictException('User with email bruno@example.com already exists.');
            mockUserService.create.mockRejectedValue(conflictError);

            await expect(controller.create(mockCreateUserDto)).rejects.toThrow(conflictError);
            expect(mockUserService.create).toHaveBeenCalledWith(mockCreateUserDto);
        });

        it('should handle service errors', async () => {
            const serviceError = new Error('Database connection failed');
            mockUserService.create.mockRejectedValue(serviceError);

            await expect(controller.create(mockCreateUserDto)).rejects.toThrow(serviceError);
            expect(mockUserService.create).toHaveBeenCalledWith(mockCreateUserDto);
        });
    });

    describe('remove', () => {
        it('should remove a user successfully', async () => {
            mockUserService.remove.mockResolvedValue(undefined);

            const result = await controller.remove('1');

            expect(mockUserService.remove).toHaveBeenCalledWith('1');
            expect(result).toBeUndefined();
        });

        it('should throw NotFoundException when user does not exist', async () => {
            const notFoundError = new NotFoundException('User with id 999 does not exists or is already deleted.');
            mockUserService.remove.mockRejectedValue(notFoundError);

            await expect(controller.remove('999')).rejects.toThrow(notFoundError);
            expect(mockUserService.remove).toHaveBeenCalledWith('999');
        });

        it('should handle service errors during removal', async () => {
            const serviceError = new Error('Database connection failed');
            mockUserService.remove.mockRejectedValue(serviceError);

            await expect(controller.remove('1')).rejects.toThrow(serviceError);
            expect(mockUserService.remove).toHaveBeenCalledWith('1');
        });
    });

    describe('findOne', () => {
        const mockUser = {
            id: '1',
            name: 'Bruno',
            email: 'bruno@example.com',
            created_at: new Date(),
            updated_at: new Date()
        };

        it('should return a user when found', async () => {
            mockUserService.findOne.mockResolvedValue(mockUser);

            const result = await controller.findOne('1');

            expect(mockUserService.findOne).toHaveBeenCalledWith('1');
            expect(result).toEqual(mockUser);
        });

        it('should throw NotFoundException when user not found', async () => {
            const notFoundError = new NotFoundException('User with id 999 does not exists.');
            mockUserService.findOne.mockRejectedValue(notFoundError);

            await expect(controller.findOne('999')).rejects.toThrow(notFoundError);
            expect(mockUserService.findOne).toHaveBeenCalledWith('999');
        });

        it('should handle service errors during findOne', async () => {
            const serviceError = new Error('Database connection failed');
            mockUserService.findOne.mockRejectedValue(serviceError);

            await expect(controller.findOne('1')).rejects.toThrow(serviceError);
            expect(mockUserService.findOne).toHaveBeenCalledWith('1');
        });
    });

    describe('parameter validation', () => {
        it('should handle different id formats', async () => {
            const mockUser = {
                id: 'uuid-format',
                name: 'Test User',
                email: 'test@example.com',
                created_at: new Date(),
                updated_at: new Date()
            };

            mockUserService.findOne.mockResolvedValue(mockUser);

            const result = await controller.findOne('uuid-format');

            expect(mockUserService.findOne).toHaveBeenCalledWith('uuid-format');
            expect(result).toEqual(mockUser);
        });

        it('should pass query parameters correctly to findAll', async () => {
            const queryParams = { page: 3, limit: 20 };
            const mockResult = {
                data: [],
                meta: { total: 0, page: 3, last_page: 0 }
            };

            mockUserService.findAll.mockResolvedValue(mockResult);

            await controller.findAll(queryParams);

            expect(mockUserService.findAll).toHaveBeenCalledWith(queryParams);
        });
    });

    describe('HTTP status codes behavior', () => {
        it('should implicitly return 200 for GET requests', async () => {
            const mockUser = {
                id: '1',
                name: 'Bruno',
                email: 'bruno@example.com',
                created_at: new Date(),
                updated_at: new Date()
            };

            mockUserService.findOne.mockResolvedValue(mockUser);

            const result = await controller.findOne('1');

            expect(result).toEqual(mockUser);
        });

        it('should handle POST creation with CREATED status code', async () => {
            const mockCreateUserDto = {
                name: 'New User',
                email: 'newuser@example.com',
                password: 'password123'
            };

            const mockCreatedUser = {
                id: '2',
                name: 'New User',
                email: 'newuser@example.com',
                created_at: new Date(),
                updated_at: new Date()
            };

            mockUserService.create.mockResolvedValue(mockCreatedUser);

            const result = await controller.create(mockCreateUserDto);

            expect(result).toEqual(mockCreatedUser);
        });

        it('should handle DELETE with NO_CONTENT status code', async () => {
            mockUserService.remove.mockResolvedValue(undefined);

            const result = await controller.remove('1');

            expect(result).toBeUndefined();
        });
    });
});