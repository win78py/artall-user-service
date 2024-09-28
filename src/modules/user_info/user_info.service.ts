import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, FindOneOptions, In, Repository } from 'typeorm';
import { UserInfo } from '../../entities/userInfo.entity';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { Multer } from 'multer';
import { CreateUserInfoDto } from './dto/create-user_info.dto';
import { validate as uuidValidate } from 'uuid';
import { Follow } from '../../entities/follow.entity';
import {
  CheckUserInfoExistsRequest,
  CheckUserInfoExistsResponse,
  DeleteUserInfoResponse,
  GetAllUsersInfoRequest,
  GetUserInfoIdRequest,
  PageMeta,
  UpdateUserInfoRequest,
  UserInfoResponse,
  UserResponse,
  UsersInfoResponse,
  UsersResponse,
} from '../../common/interface/userInfo.interface';
import { RpcException } from '@nestjs/microservices';
import { UserProfile } from '../../entities/userProfile.entity';
import { BlockList } from '../../entities/blockList.entity';
import { Post } from '../../entities/post.entity';
import { Like } from '../../entities/like.entity';
import { LikeComment } from '../../entities/likeComment.entity';
import { Comment } from '../../entities/comment.entity';
import { Order } from 'src/common/enum/enum';

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

  async getUsers(params: GetAllUsersInfoRequest): Promise<UsersResponse> {
    const usersInfo = this.usersInfoRepository
      .createQueryBuilder('userInfo')
      .leftJoinAndSelect('userInfo.userProfile', 'userProfile')
      .skip(params.skip)
      .take(params.take)
      .orderBy('userInfo.createdAt', Order.DESC);

    if (params.username) {
      usersInfo.andWhere('userInfo.username ILIKE :username', {
        username: `%${params.username}%`,
      });
    }

    if (params.fullName) {
      usersInfo.andWhere('userProfile.fullName ILIKE :fullName', {
        fullName: `%${params.fullName}%`,
      });
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
      userProfile: user.userProfile
        ? {
            id: user.userProfile.id,
            password: user.userProfile.password,
            fullName: user.userProfile.fullName,
            email: user.userProfile.email,
            phoneNumber: user.userProfile.phoneNumber,
            bio: user.userProfile.bio,
            role: user.userProfile.role,
            birthDate: user.userProfile.birthDate
              ? user.userProfile.birthDate.toISOString().split('T')[0]
              : null,
            location: user.userProfile.location,
            website: user.userProfile.website,
            socialLinks: user.userProfile.socialLinks,
            lastLogin: user.userProfile.lastLogin
              ? user.userProfile.lastLogin.toISOString()
              : null,
            profileVisibility: user.userProfile.profileVisibility,
            gender: user.userProfile.gender,
            isActive: user.userProfile.isActive,
            createdAt: user.userProfile.createdAt
              ? user.userProfile.createdAt.toISOString()
              : null,
            createdBy: user.userProfile.createdBy || null,
            updatedAt: user.userProfile.updatedAt
              ? user.userProfile.updatedAt.toISOString()
              : null,
            updatedBy: user.userProfile.updatedBy || null,
            deletedAt: user.userProfile.deletedAt
              ? user.userProfile.deletedAt.toISOString()
              : null,
            deletedBy: user.userProfile.deletedBy || null,
          }
        : null,
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

  async getUsersInfo(
    params: GetAllUsersInfoRequest,
  ): Promise<UsersInfoResponse> {
    const usersInfo = this.usersInfoRepository
      .createQueryBuilder('userInfo')
      .skip(params.skip)
      .take(params.take)
      .orderBy('userInfo.createdAt', Order.DESC);

    if (params.username) {
      usersInfo.andWhere('usersInfo.username ILIKE :username', {
        username: `%${params.username}%`,
      });
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

  async getUserInfoById(request: GetUserInfoIdRequest): Promise<UserResponse> {
    const user = await this.usersInfoRepository
      .createQueryBuilder('userInfo')
      .leftJoinAndSelect('userInfo.userProfile', 'userProfile')
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
      userProfile: user.userProfile
        ? {
            id: user.userProfile.id,
            password: user.userProfile.password,
            fullName: user.userProfile.fullName,
            email: user.userProfile.email,
            phoneNumber: user.userProfile.phoneNumber,
            bio: user.userProfile.bio,
            role: user.userProfile.role,
            birthDate: user.userProfile.birthDate
              ? user.userProfile.birthDate.toISOString().split('T')[0]
              : null,
            location: user.userProfile.location,
            website: user.userProfile.website,
            socialLinks: user.userProfile.socialLinks,
            lastLogin: user.userProfile.lastLogin
              ? user.userProfile.lastLogin.toISOString()
              : null,
            profileVisibility: user.userProfile.profileVisibility,
            gender: user.userProfile.gender,
            isActive: user.userProfile.isActive,
            createdAt: user.userProfile.createdAt
              ? user.userProfile.createdAt.toISOString()
              : null,
            createdBy: user.userProfile.createdBy || null,
            updatedAt: user.userProfile.updatedAt
              ? user.userProfile.updatedAt.toISOString()
              : null,
            updatedBy: user.userProfile.updatedBy || null,
            deletedAt: user.userProfile.deletedAt
              ? user.userProfile.deletedAt.toISOString()
              : null,
            deletedBy: user.userProfile.deletedBy || null,
          }
        : null,
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

        userInfo.profilePicture = await this.uploadAndReturnUrl({
          buffer: profilePicture,
          mimetype: 'image/jpeg',
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

    await this.entityManager.transaction(async (transactionalEntityManager) => {
      await transactionalEntityManager.softDelete(UserProfile, {
        userInfoId: id,
      });
      await transactionalEntityManager.softDelete(Follow, { followerId: id });
      await transactionalEntityManager.softDelete(Follow, { followingId: id });
      await transactionalEntityManager.softDelete(BlockList, {
        blockerId: id,
      });
      await transactionalEntityManager.softDelete(BlockList, {
        blockedId: id,
      });
      await transactionalEntityManager.softDelete(Like, { userId: id });

      const comments = await transactionalEntityManager.find(Comment, {
        where: { userId: id },
      });
      const commentIds = comments.map((comment) => comment.id);
      if (commentIds.length > 0) {
        await transactionalEntityManager.softDelete(LikeComment, {
          comment: { id: In(commentIds) },
        });
        await transactionalEntityManager.softDelete(Comment, {
          id: In(commentIds),
        });
      }

      const posts = await transactionalEntityManager.find(Post, {
        where: { userId: id },
      });
      const postIds = posts.map((post) => post.id);
      if (postIds.length > 0) {
        await transactionalEntityManager.softDelete(Like, {
          postId: In(postIds),
        });
        const postComments = await transactionalEntityManager.find(Comment, {
          where: { postId: In(postIds) },
        });
        const postCommentIds = postComments.map((comment) => comment.id);
        if (postCommentIds.length > 0) {
          await transactionalEntityManager.softDelete(LikeComment, {
            comment: { id: In(postCommentIds) },
          });
          await transactionalEntityManager.softDelete(Comment, {
            id: In(postCommentIds),
          });
        }
        await transactionalEntityManager.softDelete(Post, { id: In(postIds) });
      }

      await transactionalEntityManager.softDelete(UserInfo, id);
    });

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
