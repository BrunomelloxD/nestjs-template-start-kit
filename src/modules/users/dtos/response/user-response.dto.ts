import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserResponseDto {
    @Expose()
    @ApiProperty({
        description: 'User unique identifier',
        example: '550e8400-e29b-41d4-a716-446655440000',
        format: 'uuid'
    })
    id: string;

    @Expose()
    @ApiProperty({
        description: 'User full name',
        example: 'John Doe'
    })
    name: string;

    @Expose()
    @ApiProperty({
        description: 'User email address',
        example: 'john.doe@example.com',
        format: 'email'
    })
    email: string;

    @Expose()
    @ApiProperty({
        description: 'User creation date',
        example: '2024-01-15T10:30:00Z',
        type: 'string',
        format: 'date-time'
    })
    created_at: Date;

    @Expose()
    @ApiProperty({
        description: 'User last update date',
        example: '2024-01-15T10:30:00Z',
        type: 'string',
        format: 'date-time'
    })
    updated_at: Date;
}