//import { MetaOption } from 'src/meta-options/meta-option.entity';
import { Module } from '@nestjs/common';
import { PaginationModule } from 'src/common/pagination/pagination.module';
import { Post } from './post.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './providers/posts.service';
import { TopicsModule } from 'src/topics/topics.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from 'src/users/users.module';
import { CreatePostProvider } from './providers/create-post.provider';
import { User } from 'src/typeorm/entities/user.entity';

@Module({
  controllers: [PostsController],
  providers: [PostsService, CreatePostProvider],
  imports: [
    UsersModule,
    TopicsModule,
    PaginationModule,
    TypeOrmModule.forFeature([Post]),
  ],
})
export class PostsModule {}
