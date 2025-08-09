import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class ResetPasswordDto {
    @ApiProperty({
        example: "novaSenhaSegura123",
        description: "Nova senha que será definida para o usuário",
    })
    @IsString()
    @IsNotEmpty()
    password: string;

    @ApiProperty({
        example: "usuario@email.com",
        description: "E-mail do usuário que está redefinindo a senha",
    })
    @IsString()
    @IsNotEmpty()
    email: string;
}