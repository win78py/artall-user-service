import {
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';

@Catch(HttpException, RpcException)
export class UserExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException | RpcException): Observable<any> {
    let status: number;
    let message: string;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      message =
        typeof response === 'string' ? response : (response as any).message;
    } else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = exception.message || 'Internal server error';
    }

    return throwError(() => ({
      statusCode: status,
      message: message,
      error: exception.name || 'Error',
    }));
  }
}

export class UserNotFoundException extends HttpException {
  constructor() {
    super('User not found', HttpStatus.NOT_FOUND);
  }
}

export class FollowNotFoundException extends HttpException {
  constructor() {
    super('Information follow not found', HttpStatus.NOT_FOUND);
  }
}
