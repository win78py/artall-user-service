import { HttpException, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager, FindOneOptions } from 'typeorm';
import {
  GenderEnum,
  profileVisibilityEnum,
  RoleEnum,
} from '../../common/enum/enum';
import { GetUserProfileParams } from './dto/getList-user_profile.dto';
import { UserNotFoundException } from '../../common/exceptions/not-found';
import { UserProfile } from '../../entities/userProfile.entity';
import {
  CheckUserProfileExistsRequest,
  CheckUserProfileExistsResponse,
  CreateUserProfileRequest,
  GetUserProfileByEmailResponse,
  GetUserProfileIdRequest,
  PageMeta,
  UpdateUserProfileRequest,
  UserDemographicsResponse,
  UserProfileResponse,
  UsersProfileResponse,
} from '../../common/interface/userProfile.interface';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class UserProfileService {
  private readonly logger = new Logger(UserProfileService.name);
  constructor(
    @InjectRepository(UserProfile)
    private readonly usersProfileRepository: Repository<UserProfile>,
    private readonly entityManager: EntityManager,
  ) {}

  async getUsersProfile(
    params: GetUserProfileParams,
  ): Promise<UsersProfileResponse> {
    const usersProfile = this.usersProfileRepository
      .createQueryBuilder('userProfile')
      .leftJoinAndSelect('userProfile.userInfo', 'userInfo')
      .skip(params.skip)
      .take(params.take)
      .orderBy('userProfile.createdAt', 'DESC');

    if (params.fullName) {
      usersProfile.andWhere('userProfile.fullName ILIKE :fullName', {
        fullName: `%${params.fullName}%`,
      });
    }

    if (params.userInfoId) {
      usersProfile.andWhere('userProfile.userInfoId = :userInfoId', {
        userInfoId: params.userInfoId,
      });
    }

    const [result, total] = await usersProfile.getManyAndCount();
    const data: UserProfileResponse[] = result.map((user) => ({
      id: user.id,
      password: user.password,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      bio: user.bio,
      role: user.role,
      birthDate: user.birthDate
        ? user.birthDate.toISOString().split('T')[0]
        : null,
      location: user.location,
      website: user.website,
      socialLinks: user.socialLinks,
      lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
      profileVisibility: user.profileVisibility,
      gender: user.gender,
      isActive: user.isActive,
      createdAt: user.createdAt ? user.createdAt.toISOString() : null,
      createdBy: user.createdBy || null,
      updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
      updatedBy: user.updatedBy || null,
      deletedAt: user.deletedAt ? user.deletedAt.toISOString() : null,
      deletedBy: user.deletedBy || null,
      userInfoId: user.userInfoId,
      userInfo: user.userInfo
        ? {
            id: user.userInfo.id,
            username: user.userInfo.username,
            profilePicture: user.userInfo.profilePicture,
            createdAt: user.userInfo.createdAt
              ? user.userInfo.createdAt.toISOString()
              : null,
            createdBy: user.userInfo.createdBy || null,
            updatedAt: user.userInfo.updatedAt
              ? user.userInfo.updatedAt.toISOString()
              : null,
            updatedBy: user.userInfo.updatedBy || null,
            deletedAt: user.userInfo.deletedAt
              ? user.userInfo.deletedAt.toISOString()
              : null,
            deletedBy: user.userInfo.deletedBy || null,
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

  async getUserDemographics(
    data: GetUserProfileParams,
  ): Promise<UserDemographicsResponse> {
    const ageGroups = ['40+', '35-39', '30-34', '25-29', '20-24', '16-19'];
    console.log('GetUserProfileParams', data);
    const currentYear = new Date().getFullYear();

    const demographics = ageGroups.map((group) => ({
      ageGroup: group,
      maleCount: 0,
      femaleCount: 0,
    }));

    const users = await this.usersProfileRepository.find();

    users.forEach((user) => {
      const birthYear = user.birthDate.getFullYear();
      const age = currentYear - birthYear;

      let ageGroupIndex = -1;

      if (age >= 40) ageGroupIndex = 0;
      else if (age >= 35) ageGroupIndex = 1;
      else if (age >= 30) ageGroupIndex = 2;
      else if (age >= 25) ageGroupIndex = 3;
      else if (age >= 20) ageGroupIndex = 4;
      else if (age >= 16) ageGroupIndex = 5;

      if (ageGroupIndex !== -1) {
        if (user.gender === GenderEnum.MALE) {
          demographics[ageGroupIndex].maleCount++;
        } else if (user.gender === GenderEnum.FEMALE) {
          demographics[ageGroupIndex].femaleCount++;
        }
      }
    });

    return { demographics };
  }

  async getUserProfileById(
    request: GetUserProfileIdRequest,
  ): Promise<UserProfileResponse> {
    const user = await this.usersProfileRepository
      .createQueryBuilder('userProfile')
      .leftJoinAndSelect('userProfile.userInfo', 'userInfo')
      .where('userProfile.id = :id', { id: request.id })
      .getOne();
    return {
      id: user.id,
      password: user.password,
      fullName: user.fullName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      bio: user.bio,
      role: user.role,
      birthDate: user.birthDate
        ? user.birthDate.toISOString().split('T')[0]
        : null,
      location: user.location,
      website: user.website,
      socialLinks: user.socialLinks,
      lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
      profileVisibility: user.profileVisibility,
      gender: user.gender,
      isActive: user.isActive,
      createdAt: user.createdAt ? user.createdAt.toISOString() : null,
      createdBy: user.createdBy || null,
      updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
      updatedBy: user.updatedBy || null,
      deletedAt: user.deletedAt ? user.deletedAt.toISOString() : null,
      deletedBy: user.deletedBy || null,
      userInfoId: user.userInfoId,
    };
  }

  async findUserProfileByEmail(
    email: string,
  ): Promise<GetUserProfileByEmailResponse | null> {
    const user = await this.usersProfileRepository.findOne({
      where: { email },
    });

    if (!user) {
      return { userProfile: null };
    }

    // Trả về đúng cấu trúc GetUserProfileByEmailResponse
    return {
      userProfile: {
        id: user.id,
        password: user.password,
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        bio: user.bio,
        role: user.role,
        birthDate: user.birthDate
          ? user.birthDate.toISOString().split('T')[0]
          : null,
        location: user.location,
        website: user.website,
        socialLinks: user.socialLinks,
        lastLogin: user.lastLogin ? user.lastLogin.toISOString() : null,
        profileVisibility: user.profileVisibility,
        gender: user.gender,
        isActive: user.isActive,
        createdAt: user.createdAt ? user.createdAt.toISOString() : null,
        createdBy: user.createdBy || null,
        updatedAt: user.updatedAt ? user.updatedAt.toISOString() : null,
        updatedBy: user.updatedBy || null,
        deletedAt: user.deletedAt ? user.deletedAt.toISOString() : null,
        deletedBy: user.deletedBy || null,
        userInfoId: user.userInfoId,
      },
    };
  }

  async create(data: CreateUserProfileRequest): Promise<UserProfileResponse> {
    const userProfile = this.usersProfileRepository.create({
      ...data,
      birthDate: data.birthDate ? new Date(data.birthDate) : null, // Chuyển đổi kiểu birthDate sang Date
      lastLogin: data.lastLogin ? new Date(data.lastLogin) : null, // Chuyển đổi kiểu lastLogin sang Date
      role: data.role || RoleEnum.USER, // Gán giá trị mặc định cho role
      profileVisibility: data.profileVisibility || profileVisibilityEnum.PUBLIC, // Gán giá trị mặc định cho profileVisibility
      gender: data.gender || GenderEnum.NULL, // Gán giá trị mặc định cho gender
      isActive: typeof data.isActive === 'boolean' ? data.isActive : true,
    } as UserProfile); // Cần cast kiểu về UserProfile

    await this.usersProfileRepository.save(userProfile);

    return {
      id: userProfile.id,
      password: userProfile.password,
      fullName: userProfile.fullName,
      email: userProfile.email,
      phoneNumber: userProfile.phoneNumber,
      bio: userProfile.bio,
      role: userProfile.role,
      birthDate: userProfile.birthDate
        ? userProfile.birthDate.toISOString().split('T')[0]
        : null,
      location: userProfile.location,
      website: userProfile.website,
      socialLinks: userProfile.socialLinks,
      lastLogin: userProfile.lastLogin
        ? userProfile.lastLogin.toISOString()
        : null,
      profileVisibility: userProfile.profileVisibility,
      gender: userProfile.gender,
      isActive: userProfile.isActive,
      createdAt: userProfile.createdAt
        ? userProfile.createdAt.toISOString()
        : null,
      createdBy: userProfile.createdBy || null,
      updatedAt: userProfile.updatedAt
        ? userProfile.updatedAt.toISOString()
        : null,
      updatedBy: userProfile.updatedBy || null,
      deletedAt: userProfile.deletedAt
        ? userProfile.deletedAt.toISOString()
        : null,
      deletedBy: userProfile.deletedBy || null,
      userInfoId: userProfile.userInfoId,
    };
  }

  async checkUserProfileExists(
    data: CheckUserProfileExistsRequest,
  ): Promise<CheckUserProfileExistsResponse> {
    const userProfile = await this.usersProfileRepository.findOne({
      where: { id: data.id },
    });
    return { exists: !!userProfile };
  }

  async update(data: UpdateUserProfileRequest): Promise<UserProfileResponse> {
    try {
      const {
        id,
        password,
        fullName,
        email,
        phoneNumber,
        bio,
        role,
        birthDate,
        location,
        website,
        socialLinks,
        lastLogin,
        profileVisibility,
        gender,
        isActive,
        userInfoId,
      } = data;

      const findOptions: FindOneOptions<UserProfile> = { where: { id } };
      const userProfile =
        await this.usersProfileRepository.findOne(findOptions);

      if (password !== undefined)
        userProfile.password = password || userProfile.password;
      if (fullName !== undefined)
        userProfile.fullName = fullName || userProfile.fullName;
      if (email !== undefined) userProfile.email = email || userProfile.email;
      if (phoneNumber !== undefined)
        userProfile.phoneNumber = phoneNumber || userProfile.phoneNumber;
      if (bio !== undefined) userProfile.bio = bio || userProfile.bio;
      if (role !== undefined && role.trim() !== '')
        userProfile.role = role as RoleEnum;
      if (birthDate && !isNaN(new Date(birthDate).getTime()))
        userProfile.birthDate = new Date(birthDate);
      if (location !== undefined)
        userProfile.location = location || userProfile.location;
      if (website !== undefined)
        userProfile.website = website || userProfile.website;
      if (socialLinks !== undefined)
        userProfile.socialLinks = socialLinks || userProfile.socialLinks;
      if (lastLogin && !isNaN(new Date(lastLogin).getTime()))
        userProfile.lastLogin = new Date(lastLogin);
      if (profileVisibility !== undefined && profileVisibility.trim() !== '')
        userProfile.profileVisibility =
          profileVisibility as profileVisibilityEnum;
      if (gender !== undefined && gender.trim() !== '')
        userProfile.gender = gender as GenderEnum;
      if (isActive !== undefined) {
        userProfile.isActive = isActive;
      }
      if (userInfoId !== undefined && userInfoId.trim() !== '')
        userProfile.userInfoId = userInfoId;

      await this.usersProfileRepository.save(userProfile);

      return {
        id: userProfile.id,
        password: userProfile.password,
        fullName: userProfile.fullName,
        email: userProfile.email,
        phoneNumber: userProfile.phoneNumber,
        bio: userProfile.bio,
        role: userProfile.role,
        birthDate: userProfile.birthDate
          ? userProfile.birthDate.toISOString().split('T')[0]
          : null,
        location: userProfile.location,
        website: userProfile.website,
        socialLinks: userProfile.socialLinks,
        lastLogin: userProfile.lastLogin
          ? userProfile.lastLogin.toISOString()
          : null,
        profileVisibility: userProfile.profileVisibility,
        gender: userProfile.gender,
        isActive: userProfile.isActive,
        createdAt: userProfile.createdAt
          ? userProfile.createdAt.toISOString()
          : null,
        createdBy: userProfile.createdBy || null,
        updatedAt: userProfile.updatedAt
          ? userProfile.updatedAt.toISOString()
          : null,
        updatedBy: userProfile.updatedBy || null,
        deletedAt: userProfile.deletedAt
          ? userProfile.deletedAt.toISOString()
          : null,
        deletedBy: userProfile.deletedBy || null,
        userInfoId: userProfile.userInfoId,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new RpcException(error.message);
    }
  }

  async remove(id: string) {
    const userProfile = await this.usersProfileRepository
      .createQueryBuilder('userProfile')
      .where('userProfile.id = :id', { id })
      .getOne();
    if (!userProfile) {
      throw new UserNotFoundException();
    }
    await this.usersProfileRepository.softDelete(id);
    return { data: null, message: 'User deletion successful' };
  }
}
