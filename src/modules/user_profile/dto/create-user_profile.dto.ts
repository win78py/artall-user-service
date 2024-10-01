import { IsNotEmpty } from 'class-validator';
import {
  GenderEnum,
  RoleEnum,
  profileVisibilityEnum,
} from '../../../common/enum/enum';

export class CreateUserProfileDto {
  @IsNotEmpty()
  password: string;

  fullName: string;

  @IsNotEmpty()
  email: string;

  phoneNumber: string;

  bio: string;

  role: RoleEnum;

  birthDate: string;

  location: string;

  website: string;

  socialLinks: string;

  profileVisibility: profileVisibilityEnum;

  gender: GenderEnum;

  lastLogin: string;

  @IsNotEmpty()
  isActive: boolean;

  @IsNotEmpty()
  userInfoId: string;
}
