import { Type } from 'class-transformer';

class PaginationMetaDto {
    total: number;
    page: number;
    last_page: number;
}

export class PaginatedResponseDto<T> {
    @Type(() => Object)
    data: T[];

    meta: PaginationMetaDto;
}