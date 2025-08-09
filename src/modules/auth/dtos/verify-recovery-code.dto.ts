import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyRecoveryCodeDto {
    @ApiProperty({
        example: 'usuario@email.com',
        description: 'E-mail do usuário que está tentando recuperar a senha',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: '123456',
        description: 'Código de verificação enviado por e-mail',
    })
    @IsString()
    @IsNotEmpty()
    code: string;
}