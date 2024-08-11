import { GenderEnum, profileVisibilityEnum } from 'src/common/enum/enum';
import { PageOptionsDto } from '../../../common/dtos/pageOption';

export class GetUserProfileParams extends PageOptionsDto {
  password: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  bio: string;
  role: string;
  birthDate: Date;
  location: string;
  website: string;
  socialLinks: any;
  lastLogin: Date;
  status: string;
  profileVisibility: profileVisibilityEnum;
  gender: GenderEnum;
  isActive: boolean;
  userInfoId: string;
  userInfo?: {
    id: string;
    username: string;
    profilePicture: string;
    createdAt: string;
    createdBy: string;
    updatedAt: string;
    updatedBy: string;
    deletedAt: string;
    deletedBy: string;
  };
}
