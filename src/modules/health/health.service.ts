import { Injectable } from '@nestjs/common';
import {
  HealthCheckRequest,
  HealthCheckResponse,
  ServingStatus,
} from '../../common/interface/health.interface';

@Injectable()
export class HealthService {
  check(request: HealthCheckRequest): HealthCheckResponse {
    const response: HealthCheckResponse = {
      status: ServingStatus.SERVING,
    };

    // Logic to check service health
    if (request.service === 'USER_SERVICE') {
      // Logic kiểm tra trạng thái của service user
      response.status = ServingStatus.SERVING;
    } else {
      response.status = ServingStatus.UNKNOWN;
    }

    return response;
  }
}
