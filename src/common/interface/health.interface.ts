import { Observable } from 'rxjs';

export interface HealthServiceClient {
  check(request: HealthCheckRequest): Observable<HealthCheckResponse>;
}

export interface HealthCheckRequest {
  service: string;
}

export interface HealthCheckResponse {
  message: string;
}
