import { Body, Controller, HttpCode, HttpStatus, Post } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { LoginUserDto } from "../dtos/login-user.dto";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { RecoveryPasswordDto } from "../dtos/recovery-password.dto";
import { PasswordService } from "../services/password.service";
import { Public } from "src/common/decorators/public.decorator";

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
}