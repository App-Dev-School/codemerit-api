import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionTopic } from 'src/common/typeorm/entities/quesion-topic.entity';
import { Repository } from 'typeorm';
import { QuestionTopicResponseDto } from '../dtos/question-topic-response.dto';

@Injectable()
export class QuestionTopicService {
  constructor(
    @InjectRepository(QuestionTopic)
    private questionTopicRepo: Repository<QuestionTopic>,
  ) {}

  async findOne(id: number): Promise<QuestionTopic | undefined> {
    return this.questionTopicRepo.findOne({ where: { id } });
  }

  async findQuestionTopicsByQuestionId(
    questionId: number,
  ): Promise<QuestionTopicResponseDto[] | null> {
    const topics = await this.questionTopicRepo.find({ where: { questionId } });
    if (!topics || topics.length === 0) {
      return null;
    }
    return topics.map((topic) => {
      const dto = new QuestionTopicResponseDto();
      dto.id = topic.topicId;
      dto.topic = topic.topic.title;
      return dto;
    });
  }

  async findByQuestionId(questionId: number): Promise<QuestionTopic[]> {
    const topics = await this.questionTopicRepo.find({
      where: { questionId },
    });

    return topics;
  }
}
