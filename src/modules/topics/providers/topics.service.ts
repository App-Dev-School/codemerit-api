import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { Repository } from 'typeorm';
import { CreateTopicDto } from '../dtos/create-topics.dto';
import { UpdateTopicDto } from '../dtos/update-topics.dto';

@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
  ) {}

  async create(createTopicDto: CreateTopicDto): Promise<Topic> {
    const topic = this.topicRepository.create(createTopicDto);
    return await this.topicRepository.save(topic);
  }

  async findAll(): Promise<Topic[]> {
    return await this.topicRepository.find();
  }

  async findOne(id: number): Promise<Topic> {
    return this.topicRepository.findOne({ where: { id } });
  }

  async update(id: number, updateTopicDto: UpdateTopicDto): Promise<Topic> {
    await this.topicRepository.update(id, updateTopicDto);
    return this.topicRepository.findOne({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    await this.topicRepository.delete(id);
  }
  findAllBySubjectId(subjectId: number): Promise<Topic[]> {
    console.log(`Fetching topics for subject ID: ${subjectId}`);
  return this.topicRepository.find({
    where: {
      subject: { id: subjectId }
    },
    relations: ['subject'],
    order: { order: 'ASC' },
  });
  }
}
