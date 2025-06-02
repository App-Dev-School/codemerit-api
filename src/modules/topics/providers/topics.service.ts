import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { Repository } from 'typeorm';
import { CreateTopicDto } from '../dtos/create-topics.dto';
import { UpdateTopicDto } from '../dtos/update-topics.dto';
import { TopicListDto } from '../dtos/topic-list.dto';

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
  async findAllBySubjectId(subjectId: number): Promise<TopicListDto[]> {
    
  // return this.topicRepository.find({
  //   where: {
  //     subject: { id: subjectId }
  //   },
  //   relations: ['subject'],
  //   order: { order: 'ASC' },
  // });
   const topics = await this.topicRepository.find({
    relations: ['subject', 'topic', 'topic.subject'],
    where: { subjectId: subjectId, isPublished: true },
  });
  
  return topics.map((t) => ({
    id: t.id,
    title: t.title,
    description: t.description,
    subjectId: t.subjectId,
    subjectName: t.subject?.title ?? '',
    parent: t.topic
      ? {
          title: t.topic.title,
          description: t.topic.description,
          subjectId: t.topic.subjectId,
          subjectName:  t.topic.subject?.title ?? '',
        }
      : null,
  }));
}
}
