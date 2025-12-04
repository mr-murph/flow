import { NestFactory, APP_GUARD } from '@nestjs/core';
import { AppModule } from './app.module';
import { TenantGuard } from './auth/tenant.guard';
import { JwtService } from '@nestjs/jwt';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Globally apply the TenantGuard
  app.useGlobalGuards(new TenantGuard(app.get(JwtService)));

  await app.listen(3001);
}
bootstrap();
