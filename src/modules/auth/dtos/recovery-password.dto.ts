import { IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RecoveryPasswordDto {
    @ApiProperty({
        example: 'usuario@email.com',
        description: 'E-mail cadastrado para recuperar a senha',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;
}