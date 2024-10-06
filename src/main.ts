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

  // Hàm thử lại để khởi động microservice
  const startMicroserviceWithRetry = async (retries = 5) => {
    try {
      await app.startAllMicroservices();
      console.log('gRPC microservice is running');
    } catch (err) {
      console.error('Error starting microservice:', err);
      if (retries > 0) {
        console.log(
          `Retrying to start gRPC microservice... (${retries} retries left)`,
        );
        await new Promise((res) => setTimeout(res, 3000)); // Thử lại sau 3 giây
        await startMicroserviceWithRetry(retries - 1); // Gọi lại hàm với số lần thử lại giảm đi
      }
    }
  };

  // Khởi động microservice gRPC với cơ chế thử lại
  await startMicroserviceWithRetry();

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
