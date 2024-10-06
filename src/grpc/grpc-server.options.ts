import { join } from 'path';
import { Transport, ClientProviderOptions } from '@nestjs/microservices';

export const grpcClientOptions: ClientProviderOptions = {
  name: 'USER_SERVICE',
  transport: Transport.GRPC,
  options: {
    package: ['users', 'grpc.health.v1'],
    protoPath: [
      join(__dirname, '../grpc/users.proto'),
      join(__dirname, '../grpc/health.proto'),
    ],
    url: 'localhost:50051',
    maxReceiveMessageLength: 20 * 1024 * 1024,
    maxSendMessageLength: 20 * 1024 * 1024,
  },
};
