import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { security } from '../../../common/config/env.config';
import { JwtPayload } from '../types/auth.types';
import { User } from '@prisma/client';

@Injectable()
export class TokenService {
    constructor(private readonly jwtService: JwtService) { }

    async generateAccessToken(user: User): Promise<string> {
        const payload = this.createPayload(user);

        return this.jwtService.sign(payload, {
            secret: security.jwt.secret,
            expiresIn: security.jwt.expiresIn,
        });
    }

    private createPayload(user: User): JwtPayload {
        return {
            sub: user.id,
            email: user.email
        };
    }

    async verifyToken(token: string): Promise<JwtPayload> {
        return this.jwtService.verify(token, {
            secret: security.jwt.secret,
        });
    }
}