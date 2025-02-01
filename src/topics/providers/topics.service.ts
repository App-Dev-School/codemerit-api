import { In, Repository } from 'typeorm';
import { CreateTopicDto } from '../dtos/create-topic.dto';
import { Injectable } from '@nestjs/common';
import { Topic } from '../topic.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class TopicsService {
  constructor(
    /**
     * Inject tagsRepository
     */
    @InjectRepository(Topic)
    private readonly tagsRepository: Repository<Topic>,
  ) {}

  public async create(createTagDto: CreateTopicDto) {
    let tag = this.tagsRepository.create(createTagDto);
    return await this.tagsRepository.save(tag);
  }

  public async findMultipleTags(tags: number[]) {
    let results = await this.tagsRepository.find({
      where: {
        id: In(tags),
      },
    });

    return results;
  }

  public async delete(id: number) {
    await this.tagsRepository.delete(id);

    return {
      deleted: true,
      id,
    };
  }

  public async softRemove(id: number) {
    await this.tagsRepository.softDelete(id);

    return {
      softDeleted: true,
      id,
    };
  }
}
