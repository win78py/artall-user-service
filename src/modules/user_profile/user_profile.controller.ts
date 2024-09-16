import { Controller } from '@nestjs/common';
import { UserProfileService } from './user_profile.service';
import { GetUserProfileParams } from './dto/getList-user_profile.dto';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CheckUserProfileExistsRequest,
  CheckUserProfileExistsResponse,
  CreateUserProfileRequest,
  DeleteUserProfileRequest,
  DeleteUserProfileResponse,
  GetUserProfileByEmailResponse,
  GetUserProfileIdRequest,
  UpdateUserProfileRequest,
  UserProfileResponse,
  UsersProfileResponse,
} from 'src/common/interface/userProfile.interface';

@Controller('user-profile')
export class UserProfileController {
  constructor(private readonly userProfileService: UserProfileService) {}

  //GET ALL USERS PROFILE
  @GrpcMethod('UserService', 'GetAllUsersProfile')
  async findAll(data: GetUserProfileParams): Promise<UsersProfileResponse> {
    return this.userProfileService.getUsersProfile(data);
  }

  //GET USER PROFILE BY ID
  @GrpcMethod('UserService', 'GetUserProfileId')
  async findOneById(
    data: GetUserProfileIdRequest,
  ): Promise<UserProfileResponse> {
    return this.userProfileService.getUserProfileById(data);
  }

  // GET USER PROFILE BY EMAIL
  @GrpcMethod('UserService', 'GetUserProfileEmail')
  async findUserProfileByEmail(data: {
    email: string;
  }): Promise<GetUserProfileByEmailResponse> {
    return this.userProfileService.findUserProfileByEmail(data.email);
  }

  //CREATE USER PROFILE
  @GrpcMethod('UserService', 'CreateUserProfile')
  async createUserProfile(
    data: CreateUserProfileRequest,
  ): Promise<UserProfileResponse> {
    return this.userProfileService.create(data);
  }

  //CHECK USER PROFILE EXISTS
  @GrpcMethod('UserService', 'CheckUserProfileExists')
  checkExists(
    data: CheckUserProfileExistsRequest,
  ): Promise<CheckUserProfileExistsResponse> {
    return this.userProfileService.checkUserProfileExists(data);
  }

  //UPDATE USER PROFILE
  @GrpcMethod('UserService', 'UpdateUserProfile')
  async update(data: UpdateUserProfileRequest): Promise<UserProfileResponse> {
    return this.userProfileService.update(data);
  }

  //DELETE USER PROFILE
  @GrpcMethod('UserService', 'DeleteUserProfile')
  async delete(
    request: DeleteUserProfileRequest,
  ): Promise<DeleteUserProfileResponse> {
    const { id } = request;
    return this.userProfileService.remove(id);
  }
}
