import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import {
  HealthCheckRequest,
  HealthCheckResponse,
  ServingStatus,
} from '../../common/interface/health.interface';

@Controller()
export class HealthController {
  @GrpcMethod('Health', 'Check')
  checkHealth(data: HealthCheckRequest): HealthCheckResponse {
    console.log('Health check request for service:', data.service);

    return {
      status: ServingStatus.SERVING,
    };
  }
}
