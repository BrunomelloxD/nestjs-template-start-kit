import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
    @ApiProperty({
        description: 'User full name',
        example: 'John Doe',
        minLength: 2,
        maxLength: 100
    })
    @IsString()
    @IsNotEmpty()
    name: string;

    @ApiProperty({
        description: 'User email address',
        example: 'john.doe@example.com',
        format: 'email'
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        description: 'User password (will be encrypted)',
        example: 'SecurePassword123!',
        minLength: 6,
        maxLength: 100
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}