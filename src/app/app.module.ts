import { Module } from '@nestjs/common';
import { HealthModule } from 'src/modules/health/health.module';
import { UserModule } from 'src/modules/users/user.module';

@Module({
  imports: [HealthModule, UserModule]
})
export class AppModule { }
