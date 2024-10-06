import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { MicroserviceOptions } from '@nestjs/microservices';
import { grpcClientOptions } from './grpc/grpc-server.options';
import { UserExceptionFilter } from './common/exceptions/user.exception';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.enableCors();

  // Khởi động HTTP server trước
  await app.listen(3001);
  console.log('HTTP server is running on http://localhost:3001');

  // Kết nối microservice gRPC
  app.connectMicroservice<MicroserviceOptions>(grpcClientOptions);
  await app.startAllMicroservices();

  // Cấu hình pipes và exception filter toàn cục
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  app.useGlobalFilters(new UserExceptionFilter());
}

bootstrap();
