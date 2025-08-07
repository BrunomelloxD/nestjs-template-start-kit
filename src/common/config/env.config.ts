import 'dotenv';

export const server = {
    config: {
        port: process.env.PORT ? +process.env.PORT : 3000,
        base_url: process.env.BASE_URL,
    }
};

export const security = {
    bcrypt: {
        saltRounds: process.env.SALT_ROUNDS ? +process.env.SALT_ROUNDS : 10
    },
    jwt: {
        expiresIn: process.env.JWT_EXPIRES_IN || '1d',
        secret: process.env.JWT_SECRET || '123'
    }
};