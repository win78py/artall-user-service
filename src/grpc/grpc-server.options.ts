import { join } from 'path';
import { Transport, ClientProviderOptions } from '@nestjs/microservices';

// const AWS_URL_USER = process.env.AWS_URL_USER;
export const grpcClientOptions: ClientProviderOptions = {
  name: 'USER_SERVICE',
  transport: Transport.GRPC,
  options: {
    package: ['users', 'grpc.health.v1'],
    protoPath: [
      join(__dirname, '../grpc/users.proto'),
      join(__dirname, '../grpc/health.proto'),
    ],
    url: 'artall-User-service-9e23a8e6c151c3e7.elb.us-east-1.amazonaws.com:50051',
    maxReceiveMessageLength: 20 * 1024 * 1024,
    maxSendMessageLength: 20 * 1024 * 1024,
  },
};
