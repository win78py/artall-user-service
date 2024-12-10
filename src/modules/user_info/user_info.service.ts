import {
  BadRequestException,
  HttpException,
  Injectable,
  NotFoundException,
  Logger,
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
  GetTotalUsersInfoRequest,
  GetUserIdRequest,
  GetUserInfoIdRequest,
  PageMeta,
  SuggestedUserResponse,
  SuggestedUsersResponse,
  TotalUsersResponse,
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
import { Order } from '../../common/enum/enum';
import { DataSource } from 'typeorm';

@Injectable()
export class UserInfoService {
  private readonly logger = new Logger(UserInfoService.name);
  constructor(
    @InjectRepository(UserInfo)
    private readonly usersInfoRepository: Repository<UserInfo>,
    private readonly entityManager: EntityManager,
    private readonly cloudinaryService: CloudinaryService,
    @InjectRepository(UserProfile)
    private readonly userProfileRepository: Repository<UserProfile>,
    private readonly dataSource: DataSource,
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

  async getUsersDeleted(
    params: GetAllUsersInfoRequest,
  ): Promise<UsersResponse> {
    const usersInfo = this.usersInfoRepository
      .createQueryBuilder('userInfo')
      .withDeleted()
      .leftJoinAndSelect('userInfo.userProfile', 'userProfile')
      .where('userInfo.deletedAt IS NOT NULL')
      .skip(params.skip)
      .take(params.take)
      .orderBy('userInfo.deletedAt', Order.DESC);
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

  async getTotalUserInfo(
    params: GetTotalUsersInfoRequest,
  ): Promise<TotalUsersResponse> {
    const period = params.period || 'year';
    const total = await this.usersInfoRepository.count();
    const joinCounts: Record<number, number> = {};
    // Tính năm trước
    const pastYear = new Date();
    pastYear.setFullYear(pastYear.getFullYear() - 1);

    // Khai báo các biến để lưu trữ số lượng người dùng cũ và hiện tại
    let oldCount, currentCount;

    // Nếu khoảng thời gian là 'năm'
    if (period === 'year') {
      // Đếm số lượng người dùng trong năm trước và năm hiện tại
      oldCount = await this.usersInfoRepository
        .createQueryBuilder('userInfo')
        .where('EXTRACT(YEAR FROM userInfo.createdAt) = :pastYear', {
          pastYear: pastYear.getFullYear(),
        })
        .getCount();

      currentCount = await this.usersInfoRepository
        .createQueryBuilder('userInfo')
        .where('EXTRACT(YEAR FROM userInfo.createdAt) = :currentYear', {
          currentYear: new Date().getFullYear(),
        })
        .getCount();
    } else if (period === 'month') {
      const currentMonth = new Date().getMonth() + 1;
      const pastMonth = currentMonth - 1 === 0 ? 12 : currentMonth - 1;
      const currentYear = new Date().getFullYear();
      const pastYear = currentMonth - 1 === 0 ? currentYear - 1 : currentYear;

      oldCount = await this.usersInfoRepository
        .createQueryBuilder('userInfo')
        .where('EXTRACT(YEAR FROM userInfo.createdAt) = :pastYear', {
          pastYear: pastYear,
        })
        .andWhere('EXTRACT(MONTH FROM userInfo.createdAt) = :pastMonth', {
          pastMonth: pastMonth,
        })
        .getCount();

      currentCount = await this.usersInfoRepository
        .createQueryBuilder('userInfo')
        .where('EXTRACT(YEAR FROM userInfo.createdAt) = :currentYear', {
          currentYear: currentYear,
        })
        .andWhere('EXTRACT(MONTH FROM userInfo.createdAt) = :currentMonth', {
          currentMonth: currentMonth,
        })
        .getCount();
    } else if (period === 'count_join') {
      // Nếu khoảng thời gian là 'count_join'
      const currentYear = new Date().getFullYear();

      // Đếm số lượng contribution được tạo theo từng tháng trong năm hiện tại
      for (let month = 0; month < 12; month++) {
        const count = await this.usersInfoRepository
          .createQueryBuilder('userInfo')
          .where('EXTRACT(YEAR FROM userInfo.createdAt) = :year', {
            year: currentYear,
          })
          .andWhere('EXTRACT(MONTH FROM userInfo.createdAt) = :month', {
            month: month + 1,
          })
          .getCount();

        joinCounts[month + 1] = count;
      }
    }

    const percentageUserChange =
      oldCount === 0 ? 100 : ((currentCount - oldCount) / oldCount) * 100;

    return {
      total,
      oldCount,
      currentCount,
      percentageUserChange,
      joinCounts: joinCounts,
    };
  }

  async getUserById(request: GetUserIdRequest): Promise<UserResponse> {
    const user = await this.usersInfoRepository
      .createQueryBuilder('userInfo')
      .leftJoinAndSelect('userInfo.userProfile', 'userProfile')
      .leftJoinAndSelect('userInfo.post', 'post')
      .leftJoinAndSelect('userInfo.follower', 'follower')
      .leftJoinAndSelect('userInfo.following', 'following')
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
      postCount: user.post.length,
      followerCount: user.following.length,
      followingCount: user.follower.length,
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

  async getUsersInfo(
    params: GetAllUsersInfoRequest,
  ): Promise<UsersInfoResponse> {
    const usersInfo = this.usersInfoRepository
      .createQueryBuilder('userInfo')
      .skip(params.skip)
      .take(params.take)
      .orderBy('userInfo.createdAt', Order.DESC);

    if (params.username) {
      usersInfo.andWhere('userInfo.username ILIKE :username', {
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

  async getSuggestedUsers(
    params: GetAllUsersInfoRequest,
  ): Promise<SuggestedUsersResponse> {
    const usersInfo = this.usersInfoRepository
      .createQueryBuilder('userInfo')
      .leftJoinAndSelect('userInfo.follower', 'follower')
      .orderBy('userInfo.createdAt', 'DESC');

    // Lọc theo username nếu có
    if (params.username) {
      usersInfo.andWhere('userInfo.username ILIKE :username', {
        username: `%${params.username}%`,
      });
    }

    const [result, total] = await usersInfo.getManyAndCount();

    // Lọc và sắp xếp theo số lượng người theo dõi
    const sortedData = result
      .map((user) => ({
        ...user,
        followerCount: user.follower ? user.follower.length : 0, // Đếm số lượng người theo dõi
      }))
      .sort((a, b) => b.followerCount - a.followerCount) // Sắp xếp theo followerCount giảm dần
      .slice(0, 5); // Giới hạn lấy chỉ 30 người

    const data: SuggestedUserResponse[] = sortedData.map((user) => ({
      id: user.id,
      username: user.username,
      profilePicture: user.profilePicture,
      followerCount: user.followerCount,
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

  async restoreUserInfo(userId: string): Promise<UserInfoResponse> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.startTransaction();

      // 1. Tìm và kiểm tra userInfo
      const userInfo = await queryRunner.manager
        .createQueryBuilder(UserInfo, 'userInfo')
        .withDeleted()
        .where('userInfo.id = :userId', { userId })
        .andWhere('userInfo.deletedAt IS NOT NULL')
        .getOne();

      if (!userInfo) {
        throw new RpcException('UserInfo not found or already restored');
      }

      // 2. Khôi phục userInfo
      userInfo.deletedAt = null;
      userInfo.deletedBy = null;
      await queryRunner.manager.save(userInfo);

      // 3. Khôi phục userProfile liên quan
      const userProfile = await queryRunner.manager
        .createQueryBuilder(UserProfile, 'userProfile')
        .withDeleted()
        .where('userProfile.userInfoId = :userId', { userId })
        .andWhere('userProfile.deletedAt IS NOT NULL')
        .getOne();

      if (userProfile) {
        userProfile.deletedAt = null;
        userProfile.deletedBy = null;
        await queryRunner.manager.save(userProfile);
      }

      // 4. Khôi phục các bài post liên quan
      const posts = await queryRunner.manager
        .createQueryBuilder(Post, 'post')
        .withDeleted()
        .where('post.userId = :userId', { userId })
        .andWhere('post.deletedAt IS NOT NULL')
        .getMany();

      for (const post of posts) {
        post.deletedAt = null;
        post.deletedBy = null;
        await queryRunner.manager.save(post);

        // Khôi phục các comment liên quan đến post
        const comments = await queryRunner.manager
          .createQueryBuilder(Comment, 'comment')
          .withDeleted()
          .where('comment.postId = :postId', { postId: post.id })
          .andWhere('comment.deletedAt IS NOT NULL')
          .getMany();

        for (const comment of comments) {
          comment.deletedAt = null;
          comment.deletedBy = null;
          await queryRunner.manager.save(comment);

          // Khôi phục các likeComment liên quan đến comment
          const likeComments = await queryRunner.manager
            .createQueryBuilder(LikeComment, 'likeComment')
            .withDeleted()
            .where('likeComment.commentId = :commentId', {
              commentId: comment.id,
            })
            .andWhere('likeComment.deletedAt IS NOT NULL')
            .getMany();

          for (const likeComment of likeComments) {
            likeComment.deletedAt = null;
            likeComment.deletedBy = null;
            await queryRunner.manager.save(likeComment);
          }
        }

        // Khôi phục các like liên quan đến post
        const likes = await queryRunner.manager
          .createQueryBuilder(Like, 'like')
          .withDeleted()
          .where('like.postId = :postId', { postId: post.id })
          .andWhere('like.deletedAt IS NOT NULL')
          .getMany();

        for (const like of likes) {
          like.deletedAt = null;
          like.deletedBy = null;
          await queryRunner.manager.save(like);
        }
      }

      // Commit transaction
      await queryRunner.commitTransaction();

      // Trả về thông tin userInfo đã khôi phục
      return;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error in restoreUserInfo: ${error.message}`,
        error.stack,
      );
      if (error instanceof HttpException) {
        throw error;
      }
      throw new RpcException(error.message);
    } finally {
      await queryRunner.release();
    }
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
