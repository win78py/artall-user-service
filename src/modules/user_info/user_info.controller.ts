import { Controller, Get, Param } from '@nestjs/common';
import { UserInfoService } from './user_info.service';
import { CreateUserInfoDto } from './dto/create-user_info.dto';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CheckUserInfoExistsRequest,
  CheckUserInfoExistsResponse,
  DeleteUserInfoRequest,
  DeleteUserInfoResponse,
  GetUserInfoIdRequest,
  UpdateUserInfoRequest,
  UserInfoResponse,
  UsersInfoResponse,
} from '../../common/interface/userInfo.interface';
import { GetUserInfoParams } from './dto/getList-user_info.dto';

@Controller('user-info')
export class UserInfoController {
  constructor(private readonly userInfoService: UserInfoService) {}

  //GET ALL USERS INFO
  @GrpcMethod('UserService', 'GetAllUsersInfo')
  async findAll(data: GetUserInfoParams): Promise<UsersInfoResponse> {
    return this.userInfoService.getUsersInfo(data);
  }

  //GET USER INFO BY ID
  @GrpcMethod('UserService', 'GetUserInfoId')
  async findOneById(data: GetUserInfoIdRequest): Promise<UserInfoResponse> {
    return this.userInfoService.getUserInfoById(data);
  }

  //GET USER INFO BY USERNAME
  @Get(':userName')
  async findOneByUserName(@Param('id') username: string) {
    return this.userInfoService.getUserInfoByUsername(username);
  }

  //CREATE USER INFO
  @GrpcMethod('UserService', 'CreateUserInfo')
  async createUserInfo(data: CreateUserInfoDto): Promise<UserInfoResponse> {
    return this.userInfoService.create(data);
  }

  //CHECK USER INFO EXISTS
  @GrpcMethod('UserService', 'CheckUserInfoExists')
  checkExists(
    data: CheckUserInfoExistsRequest,
  ): Promise<CheckUserInfoExistsResponse> {
    return this.userInfoService.checkUserInfoExists(data);
  }

  //UPDATE USER INFO
  @GrpcMethod('UserService', 'UpdateUserInfo')
  async update(data: UpdateUserInfoRequest): Promise<UserInfoResponse> {
    return this.userInfoService.update(data);
  }

  //DELETE USER INFO
  @GrpcMethod('UserService', 'DeleteUserInfo')
  async delete(
    request: DeleteUserInfoRequest,
  ): Promise<DeleteUserInfoResponse> {
    const { id } = request;
    return this.userInfoService.remove(id);
  }
}
