import { PaginatedResponseDto } from '../../../common/dtos/paginated-response.dto';
import { Prisma } from '../../../../generated/prisma';
import { PaginationDto } from '../../../common/dtos/pagination.dto';
import { UserResponseDto } from '../dtos/response/user-response.dto';

export abstract class IUserRepository {
    abstract findAll({ page, limit }: PaginationDto): Promise<PaginatedResponseDto<UserResponseDto>>;
    abstract create(data: Prisma.UserCreateInput): Promise<UserResponseDto>;
    abstract existsByEmail(email: string, deleted_at_filter?: boolean): Promise<boolean>;
    abstract existsById(id: string, deleted_at_filter?: boolean): Promise<boolean>;
    abstract remove(id: string): Promise<void>;
    abstract findOne(id: string): Promise<UserResponseDto | null>;
}