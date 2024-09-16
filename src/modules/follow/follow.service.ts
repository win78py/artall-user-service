import { BadRequestException, Injectable } from '@nestjs/common';
import { Follow } from 'src/entities/follow.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/common/enum/enum';
import { validate as uuidValidate } from 'uuid';
import { FollowNotFoundException } from 'src/common/exceptions/not-found';
import {
  CheckFollowExistsRequest,
  CheckFollowExistsResponse,
  CreateFollowRequest,
  FollowerFollowingResponse,
  FollowResponse,
  GetAllFollowRequest,
  GetFollowIdRequest,
  ManyFollowResponse,
  PageMeta,
} from 'src/common/interface/follow.interface';

@Injectable()
export class FollowService {
  constructor(
    @InjectRepository(Follow)
    private readonly followRepository: Repository<Follow>,
    private readonly entityManager: EntityManager,
  ) {}

  async getFollow(params: GetAllFollowRequest): Promise<ManyFollowResponse> {
    const follow = this.followRepository
      .createQueryBuilder('follow')
      .leftJoinAndSelect('follow.follower', 'follower')
      .leftJoinAndSelect('follow.following', 'following')
      .skip(params.skip)
      .take(params.take)
      .orderBy('follow.createdAt', Order.DESC);
    if (params.follower) {
      follow.andWhere('follow.followerId = :followerId', {
        followerId: params.follower,
      });
    }
    if (params.following) {
      follow.andWhere('follow.followingId = :followingId', {
        followingId: params.following,
      });
    }
    const [result, total] = await follow.getManyAndCount();
    const data: FollowerFollowingResponse[] = result.map((follow) => ({
      id: follow.id,
      followerId: follow.follower.id,
      followingId: follow.following.id,
      createdAt: follow.createdAt ? follow.createdAt.toISOString() : null,
      createdBy: follow.createdBy || null,
      updatedAt: follow.updatedAt ? follow.updatedAt.toISOString() : null,
      updatedBy: follow.updatedBy || null,
      deletedAt: follow.deletedAt ? follow.deletedAt.toISOString() : null,
      deletedBy: follow.deletedBy || null,
      follower: {
        username: follow.follower.username,
        profilePicture: follow.follower.profilePicture,
      },
      following: {
        username: follow.following.username,
        profilePicture: follow.following.profilePicture,
      },
    }));

    const meta: PageMeta = {
      page: params.page,
      take: params.take,
      itemCount: total,
      pageCount: Math.ceil(total / params.take),
      hasPreviousPage: params.page > 1,
      hasNextPage: params.page < Math.ceil(total / params.take),
    };

    return { data, meta, message: 'Success' };
  }

  async getFollowById(request: GetFollowIdRequest): Promise<FollowResponse> {
    const follow = await this.followRepository
      .createQueryBuilder('follow')
      .select(['follow'])
      .where('follow.id = :id', { id: request.id })
      .getOne();
    return {
      id: follow.id,
      followerId: follow.followerId,
      followingId: follow.followingId,
      createdAt: follow.createdAt ? follow.createdAt.toISOString() : null,
      createdBy: follow.createdBy || null,
      updatedAt: follow.updatedAt ? follow.updatedAt.toISOString() : null,
      updatedBy: follow.updatedBy || null,
      deletedAt: follow.deletedAt ? follow.deletedAt.toISOString() : null,
      deletedBy: follow.deletedBy || null,
    };
  }

  async create(data: CreateFollowRequest): Promise<FollowResponse> {
    const follow = this.followRepository.create({
      ...data,
    });

    await this.followRepository.save(follow);

    return {
      id: follow.id,
      followerId: follow.followerId,
      followingId: follow.followingId,
      createdAt: follow.createdAt ? follow.createdAt.toISOString() : null,
      createdBy: follow.createdBy || null,
      updatedAt: follow.updatedAt ? follow.updatedAt.toISOString() : null,
      updatedBy: follow.updatedBy || null,
      deletedAt: follow.deletedAt ? follow.deletedAt.toISOString() : null,
      deletedBy: follow.deletedBy || null,
    };
  }

  async checkFollowExists(
    data: CheckFollowExistsRequest,
  ): Promise<CheckFollowExistsResponse> {
    const follow = await this.followRepository.findOne({
      where: { id: data.id },
    });
    return { exists: !!follow };
  }

  async remove(id: string) {
    if (!uuidValidate(id)) {
      throw new BadRequestException('Invalid UUID');
    }
    const follow = await this.followRepository
      .createQueryBuilder('follow')
      .where('follow.id = :id', { id })
      .getOne();
    if (!follow) {
      throw new FollowNotFoundException();
    }
    await this.followRepository.softDelete(id);
    return { data: null, message: 'User deletion successful' };
  }
}
