import { AbstractEntity } from '../common/entities/abstract.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Follow } from './follow.entity';

@Entity()
export class UserInfo extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  username: string;

  @Column({ nullable: true })
  profilePicture: string =
    'https://res.cloudinary.com/dnjkwuc7p/image/upload/v1712043752/avatar/default_avatar.png';

  // Follow relationship
  @OneToMany(() => Follow, (follow) => follow.follower, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  follower: Follow[];

  @OneToMany(() => Follow, (follow) => follow.following, {
    cascade: true,
    onUpdate: 'CASCADE',
  })
  following: Follow[];

  constructor(userInfo: Partial<UserInfo>) {
    super();
    Object.assign(this, userInfo);
  }
}
