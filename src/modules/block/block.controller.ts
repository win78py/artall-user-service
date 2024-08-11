import { Controller } from '@nestjs/common';
import { BlockService } from './block.service';
import { GrpcMethod } from '@nestjs/microservices';
import {
  CheckBlockExistsRequest,
  CheckBlockExistsResponse,
  CreateBlockRequest,
  DeleteBlockRequest,
  DeleteBlockResponse,
  GetBlockIdRequest,
  BlockResponse,
  ManyBlockResponse,
} from 'src/common/interface/block.interface';
import { GetBlockParams } from './dto/getList-block.dto';

@Controller('block-list')
export class BlockController {
  constructor(private readonly blockService: BlockService) {}

  //GET ALL BLOCK LIST
  @GrpcMethod('UserService', 'GetAllBlockList')
  async findAll(data: GetBlockParams): Promise<ManyBlockResponse> {
    return this.blockService.getBlockList(data);
  }

  //GET BLOCK BY ID
  @GrpcMethod('UserService', 'GetBlockId')
  async findOneById(data: GetBlockIdRequest): Promise<BlockResponse> {
    return this.blockService.getBlockById(data);
  }

  //CREATE BLOCK
  @GrpcMethod('UserService', 'CreateBlock')
  async createBlock(data: CreateBlockRequest): Promise<BlockResponse> {
    return this.blockService.create(data);
  }

  //CHECK BLOCK EXISTS
  @GrpcMethod('UserService', 'CheckBlockExists')
  checkExists(
    data: CheckBlockExistsRequest,
  ): Promise<CheckBlockExistsResponse> {
    return this.blockService.checkBlockExists(data);
  }

  //DELETE BLOCK
  @GrpcMethod('UserService', 'DeleteBlock')
  async delete(request: DeleteBlockRequest): Promise<DeleteBlockResponse> {
    const { id } = request;
    return this.blockService.remove(id);
  }
}
