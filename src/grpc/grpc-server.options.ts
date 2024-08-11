import { join } from 'path';
import { Transport, ClientProviderOptions } from '@nestjs/microservices';

export const grpcClientOptions: ClientProviderOptions = {
  name: 'USER_SERVICE',
  transport: Transport.GRPC,
  options: {
    package: 'users',
    protoPath: join(__dirname, '../grpc/users.proto'),
    loader: {
      includeDirs: [join(__dirname, '../grpc/users.proto')],
      keepCase: true,
      defaults: true,
    },
    url: 'localhost:50051',
  },
};
