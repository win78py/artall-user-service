import { BadRequestException, Injectable } from '@nestjs/common';
import { Follow } from 'src/entities/follow.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GetFollowParams } from './dto/getList-follow.dto';
import { Order } from 'src/common/enum/enum';
import { validate as uuidValidate } from 'uuid';
import { FollowNotFoundException } from 'src/common/exceptions/not-found';
import {
  CheckFollowExistsRequest,
  CheckFollowExistsResponse,
  CreateFollowRequest,
  FollowResponse,
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

  async getFollow(params: GetFollowParams): Promise<ManyFollowResponse> {
    const follow = this.followRepository
      .createQueryBuilder('follow')
      .select(['follow'])
      .skip(params.skip)
      .take(params.take)
      .orderBy('follow.createdAt', Order.DESC);
    if (params.search) {
      follow.andWhere('follow.followerId ILIKE :followerId', {
        follow: `%${params.search}%`,
      });
    }
    const [result, total] = await follow.getManyAndCount();
    const data: FollowResponse[] = result.map((follow) => ({
      id: follow.id,
      followerId: follow.followerId,
      followingId: follow.followingId,
      createdAt: follow.createdAt ? follow.createdAt.toISOString() : null,
      createdBy: follow.createdBy || null,
      updatedAt: follow.updatedAt ? follow.updatedAt.toISOString() : null,
      updatedBy: follow.updatedBy || null,
      deletedAt: follow.deletedAt ? follow.deletedAt.toISOString() : null,
      deletedBy: follow.deletedBy || null,
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
