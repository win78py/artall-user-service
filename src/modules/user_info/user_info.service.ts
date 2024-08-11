import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOneOptions, Repository } from 'typeorm';
import { UserInfo } from '../../entities/userInfo.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Multer } from 'multer';
import { CreateUserInfoDto } from './dto/create-user_info.dto';
import { validate as uuidValidate } from 'uuid';
import { Follow } from 'src/entities/follow.entity';
import {
  CheckUserInfoExistsRequest,
  CheckUserInfoExistsResponse,
  DeleteUserInfoResponse,
  GetUserInfoIdRequest,
  PageMeta,
  UpdateUserInfoRequest,
  UserInfoResponse,
  UsersInfoResponse,
} from '../../common/interface/userInfo.interface';
import { GetUserInfoParams } from './dto/getList-user_info.dto';
import { RpcException } from '@nestjs/microservices';
import { UserProfile } from 'src/entities/userProfile.entity';

@Injectable()
export class UserInfoService {
  constructor(
    @InjectRepository(UserInfo)
    private readonly usersInfoRepository: Repository<UserInfo>,
    private readonly entityManager: EntityManager,
    private readonly cloudinaryService: CloudinaryService,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
  ) {}

  async getUsersInfo(params: GetUserInfoParams): Promise<UsersInfoResponse> {
    const usersInfo = this.usersInfoRepository
      .createQueryBuilder('userInfo')
      .withDeleted()
      .skip(params.skip)
      .take(params.take)
      .orderBy('userInfo.createdAt', params.order || 'DESC');

    // if (params.search) {
    //   queryBuilder.andWhere('CAST(userInfo.deletedAt AS TEXT) ILIKE :search', {
    //     search: `%${params.search}%`,
    //   });
    // }

    if (params.search) {
      if (params.search === 'null') {
        // Tìm kiếm các bản ghi có deletedAt là NULL
        usersInfo.andWhere('userInfo.deletedAt IS NULL');
      } else {
        // Tìm kiếm dựa trên giá trị search thông thường cho deletedAt
        usersInfo.andWhere('CAST(userInfo.deletedAt AS TEXT) ILIKE :search', {
          search: `%${params.search}%`,
        });
      }
    }
    const [result, total] = await usersInfo.getManyAndCount();

    const data: UserInfoResponse[] = result.map((user) => ({
      id: user.id,
      username: user.username,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt ? user.createdAt.toISOString() : null,
      createdBy: user.createdBy || null,
      updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
      updatedBy: user.updatedBy || null,
      deletedAt: user.deletedAt ? user.deletedAt.toISOString() : null,
      deletedBy: user.deletedBy || null,
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

  async getUserInfoById(
    request: GetUserInfoIdRequest,
  ): Promise<UserInfoResponse> {
    const user = await this.usersInfoRepository
      .createQueryBuilder('userInfo')
      .where('userInfo.id = :id', { id: request.id })
      .getOne();

    if (!user) {
      throw new NotFoundException(`User with ID ${request.id} not found`);
    }

    return {
      id: user.id,
      username: user.username,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt ? user.createdAt.toISOString() : null,
      createdBy: user.createdBy || '',
      updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
      updatedBy: user.updatedBy || '',
      deletedAt: user.deletedAt ? user.deletedAt.toISOString() : null,
      deletedBy: user.deletedBy || '',
    };
  }

  async getUserInfoByUsername(username: string): Promise<UserInfo | undefined> {
    const userInfo = await this.usersInfoRepository
      .createQueryBuilder('userInfo')
      .select(['userInfo'])
      .where('userInfo.username = :username', { username })
      .getOne();
    return userInfo;
  }

  async create(
    createUserInfoDto: CreateUserInfoDto,
  ): Promise<UserInfoResponse> {
    const userInfo = this.entityManager.create(UserInfo, createUserInfoDto);
    await this.entityManager.save(userInfo);

    const data: UserInfoResponse = {
      id: userInfo.id,
      username: userInfo.username,
      profilePicture: userInfo.profilePicture,
      createdAt: userInfo.createdAt ? userInfo.createdAt.toISOString() : null,
      createdBy: userInfo.createdBy || null,
      updatedAt: userInfo.updatedAt ? userInfo.updatedAt.toISOString() : null,
      updatedBy: userInfo.updatedBy || null,
      deletedAt: userInfo.deletedAt ? userInfo.deletedAt.toISOString() : null,
      deletedBy: userInfo.deletedBy || null,
    };

    return data;
  }

  async checkUserInfoExists(
    data: CheckUserInfoExistsRequest,
  ): Promise<CheckUserInfoExistsResponse> {
    const userInfo = await this.usersInfoRepository.findOne({
      where: { id: data.id },
    });
    return { exists: !!userInfo };
  }

  async update(data: UpdateUserInfoRequest): Promise<UserInfoResponse> {
    try {
      const { id, username, profilePicture } = data;

      const findOptions: FindOneOptions<UserInfo> = { where: { id } };
      const userInfo = await this.usersInfoRepository.findOne(findOptions);

      if (
        profilePicture &&
        Buffer.isBuffer(profilePicture) &&
        profilePicture.length > 0
      ) {
        await this.deleteOldAvatar(userInfo);

        // Upload ảnh và cập nhật URL
        userInfo.profilePicture = await this.uploadAndReturnUrl({
          buffer: profilePicture,
          mimetype: 'image/jpeg', // Giả sử định dạng là image/jpeg, bạn có thể thay đổi nếu cần
        });
      }

      if (username !== undefined)
        userInfo.username = username || userInfo.username;

      await this.usersInfoRepository.save(userInfo);

      return {
        id: userInfo.id,
        username: userInfo.username,
        profilePicture: userInfo.profilePicture,
        createdAt: userInfo.createdAt.toISOString(),
        createdBy: userInfo.createdBy,
        updatedAt: userInfo.updatedAt.toISOString(),
        updatedBy: userInfo.updatedBy,
        deletedAt: userInfo.deletedAt?.toISOString() || null,
        deletedBy: userInfo.deletedBy,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new RpcException(error.message);
    }
  }

  async remove(id: string): Promise<DeleteUserInfoResponse> {
    if (!uuidValidate(id)) {
      throw new BadRequestException('Invalid UUID');
    }

    const userInfo = await this.usersInfoRepository
      .createQueryBuilder('userInfo')
      .leftJoinAndSelect('userInfo.follower', 'follower')
      .where('userInfo.id = :id', { id })
      .getOne();

    if (!userInfo) {
      throw new NotFoundException(`UserInfo with ID ${id} not found`);
    }

    if (userInfo.follower && userInfo.follower.length > 0) {
      for (const follower of userInfo.follower) {
        await this.entityManager.softDelete(Follow, {
          id: follower.id,
        });
      }
    }

    const userProfile = await this.userProfileRepository
      .createQueryBuilder('userProfile')
      .where('userProfile.userInfoId = :id', { id })
      .getOne();

    if (userProfile) {
      await this.userProfileRepository.softDelete(userProfile.id);
    }

    await this.usersInfoRepository.softDelete(id);

    return {
      data: null,
      message: 'User Info deletion successful',
    };
  }

  //CLOUDINARY
  async deleteOldAvatar(userInfo: UserInfo): Promise<void> {
    if (userInfo.profilePicture) {
      const publicId = this.cloudinaryService.extractPublicIdFromUrl(
        userInfo.profilePicture,
      );
      await this.cloudinaryService.deleteFile(publicId);
    }
  }

  async uploadAndReturnUrl(file: Multer.File): Promise<string> {
    try {
      const result = await this.cloudinaryService.uploadImageFile(file);
      return result.secure_url;
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      throw error;
    }
  }
}
