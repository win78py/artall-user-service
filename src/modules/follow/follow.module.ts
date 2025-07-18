import { Module } from '@nestjs/common';
import { FollowService } from './follow.service';
import { FollowController } from './follow.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Follow } from '../../entities/follow.entity';
import { UserInfo } from '../../entities/userInfo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Follow, UserInfo])],
  controllers: [FollowController],
  providers: [FollowService],
})
export class FollowModule {}
