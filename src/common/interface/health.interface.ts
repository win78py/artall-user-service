import { Observable } from 'rxjs';

export interface HealthServiceClient {
  check(request: HealthCheckRequest): Observable<HealthCheckResponse>;
}

export interface HealthCheckRequest {
  service: string;
}

export interface HealthCheckResponse {
  status: ServingStatus;
}

export enum ServingStatus {
  UNKNOWN = 0,
  SERVING = 1,
  NOT_SERVING = 2,
}
