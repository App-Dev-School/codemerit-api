import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { IsNull, Not, Repository } from 'typeorm';
import { CreateTopicDto } from '../dtos/create-topics.dto';
import { UpdateTopicDto } from '../dtos/update-topics.dto';
import { TopicListDto, TopicListItemDto } from '../dtos/topic-list.dto';
import { generateSlug, generateUniqueSlug } from 'src/common/utils/slugify.util';

@Injectable()
export class TopicsService {
  constructor(
    @InjectRepository(Topic)
    private topicRepository: Repository<Topic>,
  ) { }

  async create(createTopicDto: CreateTopicDto): Promise<TopicListItemDto> {
    let slug = generateSlug(createTopicDto.title);
    const existing = await this.topicRepository.findOne({ where: { slug } });
    if (existing) {
      slug = generateUniqueSlug(createTopicDto.title);
    }
    const topic = this.topicRepository.create({
      ...createTopicDto,
      slug : slug,
    });
    const savedTopic = await this.topicRepository.save(topic);
    console.log("TopicCreateAPI #2 savedTopic", savedTopic);
    //Fetch Topic List Item Format
    //check this
    return this.getTopicItemByID(savedTopic.id);
  }

  async findAll(): Promise<TopicListItemDto[]> {
    await this.topicRepository.find();
    const topics = await this.topicRepository.find({
      relations: ['subject'],
      order: { id: 'DESC' }, // optional: to sort by latest
    });
    // Map response to include subjectName
    return topics.map(topic => ({
      id: topic.id,
      title: topic.title,
      subjectId: topic.subjectId,
      subjectName: topic.subject.title,
      label: topic.label,
      slug: topic.slug,
      description: topic.description,
      votes: topic.votes,
      numQuestions: topic.numQuestions,
      numQuizzes: topic.numQuizzes,
      isPublished: topic.isPublished,
    }));
  }

  async findOne(id: number): Promise<Topic> {
    return this.topicRepository.findOne({ where: { id } });
  }

  async getTopicItemByID(topicId: number): Promise<TopicListItemDto> {
    const topicWithSubject = await this.topicRepository.findOne({
      where: { id: topicId },
      relations: ['subject'], // Load subject relation
    });
    console.log("TopicCreateAPI #3 topicWithSubject", topicWithSubject);
    return {
      id: topicWithSubject.id,
      title: topicWithSubject.title,
      subjectId: topicWithSubject.subjectId,
      subjectName: topicWithSubject.subject.title,
      label: topicWithSubject.label,
      slug: topicWithSubject.slug,
      description: topicWithSubject.description,
      votes: topicWithSubject.votes,
      numQuestions: topicWithSubject.numQuestions,
      numQuizzes: topicWithSubject.numQuizzes,
      isPublished: topicWithSubject.isPublished,
    };
  }

  async update(id: number, updateTopicDto: UpdateTopicDto): Promise<TopicListItemDto> {
    await this.topicRepository.update(id, updateTopicDto);
    //const updatedTopic = this.topicRepository.findOne({ where: { id } });
    return this.getTopicItemByID(id);
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
      relations: ['subject', 'parentTopic', 'subTopics'],
      where: {
        subjectId: subjectId,
        isPublished: true,
        parent: IsNull(),
      },
    });
    console.log('topics', topics);

    return topics.map((t) => ({
      id: t.id,
      title: t.title,
      description: t.description,
      subjectId: t.subjectId,
      subjectName: t.subject?.title ?? '',
      subTopics: t.subTopics ? t.subTopics?.map((subTopic) => ({
        id: subTopic.id,
        title: subTopic.title,
        description: subTopic.description,
      })) : [],
    }));
  }
}
