import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/app.module';
import { server } from './common/config/env.config'; // Importing env config to ensure it's loaded

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(server.config.port);
}
bootstrap();
