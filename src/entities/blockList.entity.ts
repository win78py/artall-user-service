import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
} from 'typeorm';
import { UserInfo } from './userInfo.entity';
import { AbstractEntity } from 'src/common/entities';

@Entity()
export class BlockList extends AbstractEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  blockerId: string;

  @Column()
  blockedId: string;

  @ManyToOne(() => UserInfo, (user) => user.follower)
  @JoinColumn({ name: 'blockerId', referencedColumnName: 'id' })
  blocker: UserInfo;

  @ManyToOne(() => UserInfo, (user) => user.following)
  @JoinColumn({ name: 'blockedId', referencedColumnName: 'id' })
  blocked: UserInfo;

  constructor(blockList: Partial<BlockList>) {
    super();
    Object.assign(this, blockList);
  }
}
