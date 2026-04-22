import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enables CORS for the frontend
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useStaticAssets(join(process.cwd(), 'uploads'), {
    prefix: '/uploads',
  });

  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');

  console.log(`
🚀 Application is running!
📦 Backend:  http://localhost:${port}
🗄️  Database: PostgreSQL connected
🌐 Frontend: http://localhost:3000
  `);
}

void bootstrap();