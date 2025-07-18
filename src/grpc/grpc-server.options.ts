import { join } from 'path';
import { Transport, ClientProviderOptions } from '@nestjs/microservices';

// const AWS_URL_USER = process.env.AWS_URL_USER;
export const grpcClientOptions: ClientProviderOptions = {
  name: 'USER_SERVICE',
  transport: Transport.GRPC,
  options: {
    package: ['users', 'health'],
    protoPath: [
      join(__dirname, '../grpc/users.proto'),
      join(__dirname, '../grpc/health.proto'),
    ],
    url: 'localhost:50051',
    maxReceiveMessageLength: 20 * 1024 * 1024,
    maxSendMessageLength: 20 * 1024 * 1024,
  },
};
