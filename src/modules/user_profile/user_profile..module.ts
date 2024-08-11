import { Module } from '@nestjs/common';
import { UserProfileService } from './user_profile.service';
import { UserProfileController } from './user_profile.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserProfile } from 'src/entities/userProfile.entity';
import { UserInfo } from 'src/entities/userInfo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserProfile, UserInfo])],
  controllers: [UserProfileController],
  providers: [UserProfileService],
})
export class UserProfileModule {}
