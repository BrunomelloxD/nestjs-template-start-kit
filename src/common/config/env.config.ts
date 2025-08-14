import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env'), quiet: true });

export const server = {
    config: {
        port: process.env.PORT ? +process.env.PORT : 3000,
        name: process.env.APP_NAME || 'nestjs-template-start-kit',
    }
};

export const security = {
    bcrypt: {
        saltRounds: process.env.SALT_ROUNDS ? +process.env.SALT_ROUNDS : 10
    },
    jwt: {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
        secret: process.env.JWT_SECRET || '123'
    },
    email: {
        mail: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
        host: process.env.MAIL_HOST,
        port: process.env.MAIL_PORT
    }
};