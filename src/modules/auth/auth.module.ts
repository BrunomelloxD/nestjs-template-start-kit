import { Module } from "@nestjs/common";
import { AuthController } from "./controllers/auth.controller";
import { AuthService } from "./services/auth.service";
import { UserService } from "../users/services/user.service";
import { TokenService } from "./services/token.service";
import { JwtService } from "@nestjs/jwt";
import { UserRepository } from "../users/repositories/user.repository";
import { PrismaService } from "src/common/prisma/services/prisma.service";
import { PasswordService } from "./services/password.service";
import { PasswordRecoveryRepository } from "./repositories/password-recovery.repository";
import { MailService } from "../mail/services/mail.service";

@Module({
    controllers: [AuthController],
    providers: [PasswordRecoveryRepository, MailService, PrismaService, PasswordService, UserRepository, JwtService, AuthService, TokenService, UserService],
    exports: []
})
export class AuthModule { }