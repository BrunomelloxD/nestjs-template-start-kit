import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class PaginationMetaDto {
    @ApiProperty({
        description: 'Total number of items',
        example: 100
    })
    total: number;

    @ApiProperty({
        description: 'Current page number',
        example: 1
    })
    page: number;

    @ApiProperty({
        description: 'Last page number',
        example: 10
    })
    last_page: number;
}

export class PaginatedResponseDto<T> {
    @Type(() => Object)
    @ApiProperty({
        description: 'Array of items',
        isArray: true
    })
    data: T[];

    @ApiProperty({
        description: 'Pagination metadata',
        type: PaginationMetaDto
    })
    meta: PaginationMetaDto;
}