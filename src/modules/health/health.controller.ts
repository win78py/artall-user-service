import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { HealthCheckResponse } from '../../common/interface/health.interface';
import { HealthService } from './health.service';
@Controller()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @GrpcMethod('Health', 'Check')
  checkHealth(): HealthCheckResponse {
    // Gọi service để trả về kết quả
    return this.healthService.check();
  }
}
