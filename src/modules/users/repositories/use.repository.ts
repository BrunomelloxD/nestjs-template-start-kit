import { Injectable } from "@nestjs/common";
import { IUserRepository } from "./use.repository.interface";
import { PrismaService } from '../../../common/prisma/services/prisma.service';
import { Prisma } from "../../../../generated/prisma";
import { PaginatedResponseDto } from "src/common/dtos/paginated-response.dto";
import { PaginationDto } from "../../../common/dtos/pagination.dto";
import { UserResponseDto } from "../dtos/response/user-response.dto";

@Injectable()
export class UserRepository implements IUserRepository {
    constructor(private readonly prismaService: PrismaService) { }

    async findOne(id: string): Promise<UserResponseDto | null> {
        return await this.prismaService.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                created_at: true,
                updated_at: true
            }
        });
    }

    async remove(id: string): Promise<void> {
        await this.prismaService.user.update({
            where: { id },
            data: { deleted_at: new Date() },
        })
    }

    async findAll({ page = 1, limit = 10 }: PaginationDto): Promise<PaginatedResponseDto<UserResponseDto>> {
        const [users, total] = await this.prismaService.$transaction([
            this.prismaService.user.findMany({
                skip: (page - 1) * limit,
                take: limit,
                where: { deleted_at: null },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    created_at: true,
                    updated_at: true
                },
                orderBy: { created_at: 'desc' },
            }),
            this.prismaService.user.count(
                { where: { deleted_at: null } }
            ),
        ]);

        return {
            data: users,
            meta: {
                total,
                page,
                last_page: Math.ceil(total / limit),
            },
        };
    }

    async create(data: Prisma.UserCreateInput): Promise<UserResponseDto> {
        return this.prismaService.user.create({ data, select: { id: true, name: true, email: true, created_at: true, updated_at: true } });
    }

    async existsByEmail(email: string, deleted_at_filter?: boolean): Promise<boolean> {
        const deleted_at = deleted_at_filter === true ? { deleted_at: null } : {};

        const user = (await this.prismaService.user.count({ where: { email, ...deleted_at } })) > 0;
        console.log(`User with email ${email} exists: ${user} (deleted_at_filter: ${deleted_at_filter})`);
        return user;
    }

    async existsById(id: string, deleted_at_filter?: boolean): Promise<boolean> {
        const deleted_at = deleted_at_filter === true ? { deleted_at: null } : {};

        return (await this.prismaService.user.count({ where: { id, ...deleted_at } })) > 0;
    }
}