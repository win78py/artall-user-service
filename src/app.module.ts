import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { DbModule } from './common/db/db.module';
import { UserInfoModule } from './modules/user_info/user_info.module';
import { UserProfileModule } from './modules/user_profile/user_profile..module';
import { FollowModule } from './modules/follow/follow.module';
import { BlockModule } from './modules/block/block.module';
import { HealthModule } from './modules/health/health.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DbModule,
    UserInfoModule,
    UserProfileModule,
    FollowModule,
    BlockModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
