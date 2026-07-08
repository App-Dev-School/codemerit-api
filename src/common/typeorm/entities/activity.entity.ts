import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { AbstractEntity } from 'src/common/typeorm/entities/abstract.entity';
import { User } from 'src/common/typeorm/entities/user.entity';

@Entity()
export class Activity extends AbstractEntity {
  @Column({
    nullable: false,
  })
  userId: number;

  @Column({
    type: 'varchar',
    length: 150,
  })
  title: string;

  @Column({
    type: 'text',
  })
  message: string;

  @Column({
    type: 'int',
    nullable: true,
  })
  dataId?: number;

  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  dataType?: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'userId',
  })
  user: User;
}
