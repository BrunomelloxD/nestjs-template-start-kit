
import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { UserService } from './services/user.service';
import { UserRepository } from './repositories/user.repository';
import { PrismaService } from 'src/common/prisma/services/prisma.service';
@Module({
    imports: [],
    controllers: [UserController],
    providers: [PrismaService, UserService, UserRepository],
})
export class UserModule { }
