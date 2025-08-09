import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { LoginUserDto } from "../dtos/login-user.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RecoveryPasswordDto } from "../dtos/recovery-password.dto";
import { PasswordService } from "../services/password.service";
import { Public } from "src/common/decorators/public.decorator";
import { ResetPasswordDto } from "../dtos/reset-password.dto";
import { VerifyRecoveryCodeDto } from "../dtos/verify-recovery-code.dto";

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService, private readonly passwordService: PasswordService) { }

    @Public()
    @Post('login')
    @ApiOperation({ summary: 'Login do usuário' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Login realizado com sucesso' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Credenciais inválidas' })
    @HttpCode(HttpStatus.OK)
    signIn(@Body() data: LoginUserDto) {
        return this.authService.signIn(data);
    }

    @Public()
    @Post('recover-password/request')
    @ApiOperation({ summary: 'Requisitar nova senha' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Requisição realizada com sucesso' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'E-mail inválido' })
    @HttpCode(HttpStatus.OK)
    recoverPassword(@Body() data: RecoveryPasswordDto) {
        return this.passwordService.recoverPassword(data.email);
    }


    @Public()
    @ApiOperation({ summary: 'Verificação de redefinição de senha' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Verificação realizada com sucesso' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Código de redefinição inválido' })
    @Post('recover-password/verify')
    async verifyRecoveryCode(@Body() data: VerifyRecoveryCodeDto) {
        return this.passwordService.verifyRecoveryCode(data);
    }

    @Public()
    @ApiOperation({ summary: 'Redefinição de senha' })
    @ApiResponse({ status: HttpStatus.OK, description: 'Redefinição realizada com sucesso' })
    @ApiResponse({ status: HttpStatus.NOT_FOUND, description: 'Código de redefinição inválido' })
    @HttpCode(HttpStatus.OK)
    @Post('recover-password/reset')
    async resetPassword(@Body() data: ResetPasswordDto) {
        return this.passwordService.resetPassword(data);
    }
}