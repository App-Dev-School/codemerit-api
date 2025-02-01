import {
  BadRequestException,
  Body,
  ConflictException,
  Injectable,
  Logger,
} from '@nestjs/common';
import { CreatePostDto } from '../dtos/create-post.dto';
import { Repository } from 'typeorm';
import { Post } from '../post.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { TopicsService } from 'src/topics/providers/topics.service';
import { ActiveUserData } from 'src/auth/interfaces/active-user-data.interface';
import { UsersService } from 'src/users/providers/users.service';

@Injectable()
export class CreatePostProvider {
  constructor(
    /*
     * Injecting Users Service
     */
    private readonly usersService: UsersService,
    /**
     * Inject postsRepository
     */
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    /**
     * Inject TagsService
     */
    private readonly tagsService: TopicsService,
  ) { }

  public async create(createPostDto: CreatePostDto, user: ActiveUserData) {
    let author = undefined;
    let tags = undefined;
    try {
      // Find author from database based on authorId
      author = await this.usersService.findOneById(user.sub);
      // Find tags
      if (createPostDto.tags)
        tags = await this.tagsService.findMultipleTags(createPostDto.tags);
    } catch (error) {
      //Should not block if topics not available
      throw new ConflictException(error);
    }

    // if (createPostDto.tags.length !== tags.length) {
    //   throw new BadRequestException('Please check your tag Ids');
    // }

    // Create post
    let post = this.postsRepository.create({
      ...createPostDto,
      author: author,
      topics: tags,
    });

    try {
      // return the post
      return await this.postsRepository.save(post);
    } catch (error) {
      throw new ConflictException(error, {
        description: 'Ensure post slug is unique and not a duplicate',
      });
    }
  }
}
