import { NestFactory, APP_GUARD, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { TenantGuard } from './auth/tenant.guard';
import { JwtService } from '@nestjs/jwt';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Globally apply the TenantGuard
  app.useGlobalGuards(new TenantGuard(app.get(JwtService), app.get(Reflector)));

  await app.listen(process.env.PORT || 3001);
}
bootstrap();
