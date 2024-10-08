import { Injectable } from '@nestjs/common';
import { HealthCheckResponse } from '../../common/interface/health.interface';

@Injectable()
export class HealthService {
  check(): HealthCheckResponse {
    return {
      message: 'Hello Artallers!',
    };
  }
}
