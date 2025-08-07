import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma } from "generated/prisma";
import { PaginatedResponseDto } from "src/common/dtos/paginated-response.dto";
import { PaginationDto } from "src/common/dtos/pagination.dto";
import { UserRepository } from "../repositories/use.repository";
import * as bcrypt from 'bcrypt';
import { security } from "src/common/config/env.config";
import { UserResponseDto } from "../dtos/response/user-response.dto";

@Injectable()
export class UserService {
    constructor(private readonly userRepository: UserRepository) { }

    async findOne(id: string): Promise<UserResponseDto | null> {
        if (!(await this.existById(id, true))) {
            throw new NotFoundException(`User with id ${id} does not exists.`);
        }

        return await this.userRepository.findOne(id);
    }

    existsByEmail(email: string, deleted_at_filter?: boolean): Promise<boolean> {
        return this.userRepository.existsByEmail(email, deleted_at_filter);
    }

    existById(id: string, deleted_at_filter?: boolean): Promise<boolean> {
        return this.userRepository.existsById(id, deleted_at_filter);
    }

    async findAll(paginationDto: PaginationDto): Promise<PaginatedResponseDto<UserResponseDto>> {
        return await this.userRepository.findAll(paginationDto);
    }

    async create(data: Prisma.UserCreateInput): Promise<UserResponseDto> {
        if (await this.existsByEmail(data.email, false)) {
            throw new ConflictException(`User with email ${data.email} already exists.`);
        }

        const hashedPassword = await bcrypt.hash(data.password, security.bcrypt.saltRounds);
        data.password = hashedPassword;

        return this.userRepository.create(data);
    }

    async remove(id: string): Promise<void> {
        if (!(await this.existById(id, true))) {
            throw new NotFoundException(`User with id ${id} does not exists or is already deleted.`);
        }

        return this.userRepository.remove(id);
    }
}