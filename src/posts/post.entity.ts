import {
  Column,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

//import { CreatePostMetaOptionsDto } from '../meta-options/dtos/create-post-meta-options.dto';
//import { MetaOption } from 'src/meta-options/meta-option.entity';
import { Topic } from 'src/topics/topic.entity';
import { postStatus } from './enums/postStatus.enum';
import { postType } from './enums/postType.enum';
import { User } from 'src/users/user.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    type: 'varchar',
    length: 512,
    nullable: false,
  })
  title: string;

  @Column({
    type: 'enum',
    enum: postType,
    nullable: false,
    default: postType.POST,
  })
  postType: postType;

  @Column({
    type: 'varchar',
    length: 256,
    nullable: false,
    unique: true,
  })
  slug: string;

  @Column({
    type: 'enum',
    enum: postStatus,
    nullable: false,
    default: postStatus.DRAFT,
  })
  status: postStatus;

  @Column({
    type: 'text',
    nullable: true,
  })
  content?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  schema?: string;

  @Column({
    type: 'varchar',
    length: 1024,
    nullable: true,
  })
  featuredImageUrl?: string;

  @Column({
    type: 'timestamp', // 'datetime' in mysql
    nullable: true,
  })
  publishOn?: Date;

  // @OneToOne(() => MetaOption, (metaOptions) => metaOptions.post, {
  //   cascade: true,
  //   eager: true,
  // })
  // metaOptions?: MetaOption;

  @ManyToOne(() => User, (user) => user.posts, {
    eager: false,
  })
  author: User;

  @ManyToMany(() => Topic, (tag) => tag.posts, {
    eager: true,
  })
  @JoinTable()
  topics?: Topic[];

  /*
  Self referencing relationship
  */
  // @Column()
  //   parentId: number;

  //   @ManyToOne(type => Post, post => post.children)
  //   @JoinColumn({ name: "parentId" })
  //   parent: Post;

    // @OneToMany(type => Category, post => post.parent)
    // children: Post[];
}
