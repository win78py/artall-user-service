import { Module } from '@nestjs/common';
import { BlockService } from './block.service';
import { BlockController } from './block.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from '../../entities/follow.entity';
import { UserInfo } from '../../entities/userInfo.entity';
import { BlockList } from '../../entities/blockList.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BlockList, Follow, UserInfo])],
  controllers: [BlockController],
  providers: [BlockService],
})
export class BlockModule {}
