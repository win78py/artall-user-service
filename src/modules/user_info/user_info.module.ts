import { Module } from '@nestjs/common';
import { UserInfoService } from './user_info.service';
import { UserInfoController } from './user_info.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserInfo } from '../../entities/userInfo.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { UserProfileService } from '../user_profile/user_profile.service';
import { UserProfile } from '../../entities/userProfile.entity';
import { Follow } from '../..//entities/follow.entity';
import { FollowService } from '../follow/follow.service';

@Module({
  imports: [TypeOrmModule.forFeature([UserInfo, UserProfile, Follow])],
  controllers: [UserInfoController],
  providers: [
    UserInfoService,
    CloudinaryService,
    UserProfileService,
    FollowService,
  ],
})
export class UserInfoModule {}
