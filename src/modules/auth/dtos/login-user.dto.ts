import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
    @ApiProperty({
        example: 'usuario@email.com',
        description: 'Endereço de e-mail do usuário',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: 'senhaSegura123',
        description: 'Senha do usuário',
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}