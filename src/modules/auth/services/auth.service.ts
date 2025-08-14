import { Injectable, NotFoundException, UnauthorizedException } from "@nestjs/common";
import { LoginUserDto } from "../dtos/login-user.dto";
import { AuthResponse } from "../types/auth.types";
import { UserService } from "src/modules/users/services/user.service";
import { TokenService } from "./token.service";
import { compare } from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(private readonly userService: UserService, private readonly tokenService: TokenService) { }

    async signIn(credentials: LoginUserDto): Promise<AuthResponse> {
        const user = await this.userService.findByEmail(credentials.email, true);
        if (!user) {
            throw new NotFoundException(`User with email ${credentials.email} does not exists.`);
        }

        if (!user.email_verified) {
            throw new UnauthorizedException(`Email not verified for user ${credentials.email}.`);
        }

        const passwordMatch = await compare(credentials.password, user.password);
        if (!passwordMatch) {
            throw new UnauthorizedException(`Password does not match.`);
        }

        const accessToken = await this.tokenService.generateAccessToken(user);

        const response: AuthResponse = {
            access_token: accessToken,
            user: {
                name: user.name,
                email: user.email
            },
        };

        return response;
    }
}