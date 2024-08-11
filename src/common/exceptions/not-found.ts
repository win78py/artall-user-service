import { HttpException, HttpStatus } from '@nestjs/common';

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
