import { Controller } from '@nestjs/common';
import { FollowService } from './follow.service';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CheckFollowExistsRequest,
  CheckFollowExistsResponse,
  CreateFollowRequest,
  DeleteFollowRequest,
  DeleteFollowResponse,
  GetFollowIdRequest,
  FollowResponse,
  ManyFollowResponse,
  GetAllFollowRequest,
  ToggleFollowResponse,
} from '../../common/interface/follow.interface';

@Controller('follow')
export class FollowController {
  constructor(private readonly followService: FollowService) {}

  //GET ALL FOLLOW
  @GrpcMethod('UserService', 'GetAllFollow')
  async findAll(data: GetAllFollowRequest): Promise<ManyFollowResponse> {
    return this.followService.getFollow(data);
  }

  //GET FOLLOW BY ID
  @GrpcMethod('UserService', 'GetFollowId')
  async findOneById(data: GetFollowIdRequest): Promise<FollowResponse> {
    return this.followService.getFollowById(data);
  }

  //CREATE FOLLOW
  @GrpcMethod('UserService', 'CreateFollow')
  async createFollow(data: CreateFollowRequest): Promise<FollowResponse> {
    return this.followService.create(data);
  }

  //TOGGLE FOLLOW
  @GrpcMethod('UserService', 'ToggleFollow')
  async toggleFollow(request: {
    followerId: string;
    followingId: string;
  }): Promise<ToggleFollowResponse> {
    return this.followService.toggleFollow(
      request.followerId,
      request.followingId,
    );
  }

  //CHECK FOLLOW EXISTS
  @GrpcMethod('UserService', 'CheckFollowExists')
  checkExists(
    data: CheckFollowExistsRequest,
  ): Promise<CheckFollowExistsResponse> {
    return this.followService.checkFollowExists(data);
  }

  //DELETE FOLLOW
  @GrpcMethod('UserService', 'DeleteFollow')
  async delete(request: DeleteFollowRequest): Promise<DeleteFollowResponse> {
    const { id } = request;
    return this.followService.remove(id);
  }
}
