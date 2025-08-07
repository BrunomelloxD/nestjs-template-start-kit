import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { server } from '../common/config/env.config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('NestJS Template Start Kit')
    .setDescription('API documentation for the NestJS Template Start Kit')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(server.config.port);
}
bootstrap();
