import { Controller, Get, Param } from '@nestjs/common';
import { UserInfoService } from './user_info.service';
import { CreateUserInfoDto } from './dto/create-user_info.dto';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CheckUserInfoExistsRequest,
  CheckUserInfoExistsResponse,
  DeleteUserInfoRequest,
  DeleteUserInfoResponse,
  GetAllUsersInfoRequest,
  GetTotalUsersInfoRequest,
  GetUserInfoIdRequest,
  SuggestedUsersResponse,
  TotalUsersResponse,
  UpdateUserInfoRequest,
  UserInfoResponse,
  UserResponse,
  UsersResponse,
} from '../../common/interface/userInfo.interface';

@Controller('user-info')
export class UserInfoController {
  constructor(private readonly userInfoService: UserInfoService) {}

  //GET ALL USERS
  @GrpcMethod('UserService', 'GetAllUsers')
  async findAllUsers(data: GetAllUsersInfoRequest): Promise<UsersResponse> {
    return this.userInfoService.getUsers(data);
  }

  @GrpcMethod('UserService', 'GetAllUsersDeleted')
  async findAllUsersDeleted(
    data: GetAllUsersInfoRequest,
  ): Promise<UsersResponse> {
    return this.userInfoService.getUsersDeleted(data);
  }

  //GET ALL USERS INFO
  @GrpcMethod('UserService', 'GetAllUsersInfo')
  async findAll(data: GetAllUsersInfoRequest): Promise<UsersResponse> {
    return this.userInfoService.getUsersInfo(data);
  }

  @GrpcMethod('UserService', 'GetSuggestedUsers')
  async findSuggestedUsers(
    data: GetAllUsersInfoRequest,
  ): Promise<SuggestedUsersResponse> {
    return this.userInfoService.getSuggestedUsers(data);
  }

  @GrpcMethod('UserService', 'GetTotalUsersInfo')
  async findTotalUserInfo(
    data: GetTotalUsersInfoRequest,
  ): Promise<TotalUsersResponse> {
    return this.userInfoService.getTotalUserInfo(data);
  }

  //GET USER BY ID
  @GrpcMethod('UserService', 'GetUserId')
  async findOneUserById(data: GetUserInfoIdRequest): Promise<UserResponse> {
    return this.userInfoService.getUserById(data);
  }

  //GET USER INFO BY ID
  @GrpcMethod('UserService', 'GetUserInfoId')
  async findOneUserInfoById(data: GetUserInfoIdRequest): Promise<UserResponse> {
    return this.userInfoService.getUserInfoById(data);
  }

  //GET USER INFO BY USERNAME
  @Get(':username')
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
