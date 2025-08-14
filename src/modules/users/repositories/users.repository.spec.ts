import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/common/prisma/services/prisma.service';
import { UserRepository } from './user.repository';

describe('UserRepository', () => {
    let repository: UserRepository;
    let prismaService: PrismaService;

    const prismaUserMock = {
        findUnique: jest.fn(),
        update: jest.fn(),
        findMany: jest.fn(),
        count: jest.fn(),
        create: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UserRepository,
                {
                    provide: PrismaService,
                    useValue: {
                        user: prismaUserMock,
                        $transaction: jest.fn(),
                    },
                },
            ],
        }).compile();

        repository = module.get<UserRepository>(UserRepository);
        prismaService = module.get<PrismaService>(PrismaService);

        jest.clearAllMocks();
    });

    describe('findOne', () => {
        it('should return a user', async () => {
            const user = { id: '1', name: 'Bruno', email: 'bruno@example.com', created_at: new Date(), updated_at: new Date() };
            prismaUserMock.findUnique.mockResolvedValue(user);

            const result = await repository.findOne('1');

            expect(prismaUserMock.findUnique).toHaveBeenCalledWith({
                where: { id: '1' },
                select: { id: true, name: true, email: true, created_at: true, updated_at: true },
            });
            expect(result).toEqual(user);
        });
    });

    describe('remove', () => {
        it('should soft delete a user', async () => {
            prismaUserMock.update.mockResolvedValue({});

            await repository.remove('1');

            expect(prismaUserMock.update).toHaveBeenCalledWith({
                where: { id: '1' },
                data: { deleted_at: expect.any(Date) },
            });
        });
    });

    describe('findAll', () => {
        it('should return paginated users', async () => {
            const users = [{ id: '1', name: 'Bruno', email: 'bruno@example.com', created_at: new Date(), updated_at: new Date() }];
            const total = 1;

            (prismaService.$transaction as jest.Mock).mockResolvedValue([users, total]);

            const result = await repository.findAll({ page: 1, limit: 10 });

            expect(prismaService.$transaction).toHaveBeenCalledTimes(1);

            expect(result).toEqual({
                data: users,
                meta: {
                    total,
                    page: 1,
                    last_page: Math.ceil(total / 10),
                },
            });
        });

        it('should return paginated users with search', async () => {
            const users = [{ id: '1', name: 'Bruno', email: 'bruno@example.com', created_at: new Date(), updated_at: new Date() }];
            const total = 1;

            (prismaService.$transaction as jest.Mock).mockResolvedValue([users, total]);

            const result = await repository.findAll({ page: 1, limit: 10 });

            expect(prismaService.$transaction).toHaveBeenCalledTimes(1);
            expect(result).toEqual({
                data: users,
                meta: {
                    total,
                    page: 1,
                    last_page: Math.ceil(total / 10),
                },
            });
        });

        it('should handle different pages correctly', async () => {
            const users = [{ id: '2', name: 'Maria', email: 'maria@example.com', created_at: new Date(), updated_at: new Date() }];
            const total = 25;

            (prismaService.$transaction as jest.Mock).mockResolvedValue([users, total]);

            const result = await repository.findAll({ page: 3, limit: 5 });

            expect(prismaService.$transaction).toHaveBeenCalledTimes(1);
            expect(result).toEqual({
                data: users,
                meta: {
                    total,
                    page: 3,
                    last_page: 5
                },
            });
        });
    });

    describe('create', () => {
        it('should create and return user', async () => {
            const data = { name: 'Bruno', email: 'bruno@example.com', password: 'secret' };
            const createdUser = { id: '1', name: 'Bruno', email: 'bruno@example.com', created_at: new Date(), updated_at: new Date() };

            prismaUserMock.create.mockResolvedValue(createdUser);

            const result = await repository.create(data);

            expect(prismaUserMock.create).toHaveBeenCalledWith({
                data,
                select: { id: true, name: true, email: true, created_at: true, updated_at: true },
            });

            expect(result).toEqual(createdUser);
        });
    });

    describe('existsByEmail', () => {
        it('should return true if user exists', async () => {
            prismaUserMock.count.mockResolvedValue(1);

            const result = await repository.existsByEmail('bruno@example.com', true);

            expect(prismaUserMock.count).toHaveBeenCalledWith({ where: { email: 'bruno@example.com', deleted_at: null } });
            expect(result).toBe(true);
        });

        it('should return false if user does not exist', async () => {
            prismaUserMock.count.mockResolvedValue(0);

            const result = await repository.existsByEmail('noone@example.com');

            expect(prismaUserMock.count).toHaveBeenCalledWith({ where: { email: 'noone@example.com' } });
            expect(result).toBe(false);
        });
    });

    describe('existsById', () => {
        it('should return true if user exists', async () => {
            prismaUserMock.count.mockResolvedValue(1);

            const result = await repository.existsById('1', true);

            expect(prismaUserMock.count).toHaveBeenCalledWith({ where: { id: '1', deleted_at: null } });
            expect(result).toBe(true);
        });

        it('should return false if user does not exist', async () => {
            prismaUserMock.count.mockResolvedValue(0);

            const result = await repository.existsById('999');

            expect(prismaUserMock.count).toHaveBeenCalledWith({ where: { id: '999' } });
            expect(result).toBe(false);
        });
    });
});