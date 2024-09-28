import { BadRequestException, Injectable } from '@nestjs/common';
import { BlockList } from 'src/entities/blockList.entity';
import { EntityManager, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from 'src/common/enum/enum';
import { validate as uuidValidate } from 'uuid';
import {
  CheckBlockExistsRequest,
  CheckBlockExistsResponse,
  CreateBlockRequest,
  BlockResponse,
  GetBlockIdRequest,
  ManyBlockResponse,
  PageMeta,
  BlockerBlockedResponse,
  GetAllBlockListRequest,
} from 'src/common/interface/block.interface';

@Injectable()
export class BlockService {
  constructor(
    @InjectRepository(BlockList)
    private readonly blockRepository: Repository<BlockList>,
    private readonly entityManager: EntityManager,
  ) {}

  async getBlockList(
    params: GetAllBlockListRequest,
  ): Promise<ManyBlockResponse> {
    const block = this.blockRepository
      .createQueryBuilder('block')
      .leftJoinAndSelect('block.blocker', 'blocker')
      .leftJoinAndSelect('block.blocked', 'blocked')
      .skip(params.skip)
      .take(params.take)
      .orderBy('block.createdAt', Order.DESC);
    if (params.blocker) {
      block.andWhere('block.blockerId = :blockerId', {
        blockerId: params.blocker,
      });
    }
    if (params.blocked) {
      block.andWhere('block.blockedId = :blockedId', {
        blockedId: params.blocked,
      });
    }
    const [result, total] = await block.getManyAndCount();
    const data: BlockerBlockedResponse[] = result.map((block) => ({
      id: block.id,
      blockerId: block.blockerId,
      blockedId: block.blockedId,
      createdAt: block.createdAt ? block.createdAt.toISOString() : null,
      createdBy: block.createdBy || null,
      updatedAt: block.updatedAt ? block.updatedAt.toISOString() : null,
      updatedBy: block.updatedBy || null,
      deletedAt: block.deletedAt ? block.deletedAt.toISOString() : null,
      deletedBy: block.deletedBy || null,
      blocker: {
        username: block.blocker.username,
        profilePicture: block.blocker.profilePicture,
      },
      blocked: {
        username: block.blocked.username,
        profilePicture: block.blocked.profilePicture,
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

  async getBlockById(request: GetBlockIdRequest): Promise<BlockResponse> {
    const block = await this.blockRepository
      .createQueryBuilder('block')
      .select(['block'])
      .where('block.id = :id', { id: request.id })
      .getOne();
    return {
      id: block.id,
      blockerId: block.blockerId,
      blockedId: block.blockedId,
      createdAt: block.createdAt ? block.createdAt.toISOString() : null,
      createdBy: block.createdBy || null,
      updatedAt: block.updatedAt ? block.updatedAt.toISOString() : null,
      updatedBy: block.updatedBy || null,
      deletedAt: block.deletedAt ? block.deletedAt.toISOString() : null,
      deletedBy: block.deletedBy || null,
    };
  }

  async create(data: CreateBlockRequest): Promise<BlockResponse> {
    const block = this.blockRepository.create({
      ...data,
    });

    await this.blockRepository.save(block);

    return {
      id: block.id,
      blockerId: block.blockerId,
      blockedId: block.blockedId,
      createdAt: block.createdAt ? block.createdAt.toISOString() : null,
      createdBy: block.createdBy || null,
      updatedAt: block.updatedAt ? block.updatedAt.toISOString() : null,
      updatedBy: block.updatedBy || null,
      deletedAt: block.deletedAt ? block.deletedAt.toISOString() : null,
      deletedBy: block.deletedBy || null,
    };
  }

  async checkBlockExists(
    data: CheckBlockExistsRequest,
  ): Promise<CheckBlockExistsResponse> {
    const block = await this.blockRepository.findOne({
      where: { id: data.id },
    });
    return { exists: !!block };
  }

  async remove(id: string) {
    if (!uuidValidate(id)) {
      throw new BadRequestException('Invalid UUID');
    }
    await this.blockRepository
      .createQueryBuilder('block')
      .where('block.id = :id', { id })
      .getOne();
    await this.blockRepository.softDelete(id);
    return { data: null, message: 'User deletion successful' };
  }
}
