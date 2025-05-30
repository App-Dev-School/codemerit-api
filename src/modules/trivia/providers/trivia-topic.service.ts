import { Injectable} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TriviaTopic } from 'src/common/typeorm/entities/trivia-topic.entity';
import { Repository } from 'typeorm';
import { QuestionTopicResponseDto } from '../dtos/question-topic-response.dto';

@Injectable()
export class TriviaTopicService {
  constructor(
    @InjectRepository(TriviaTopic)
    private triviaTopicRepo: Repository<TriviaTopic>,
  ) {}

    async findOne(id: number): Promise<TriviaTopic | undefined> {
      return this.triviaTopicRepo.findOne({ where: { id } });
    }

    async findTriviaTopicsByTriviaId(triviaId: number): Promise<QuestionTopicResponseDto[]| null> {
      const topics = await this.triviaTopicRepo.find({ where: { triviaId } });
      if (!topics || topics.length === 0) {
        return null;
      }
      return topics.map(topic => {
        const dto = new QuestionTopicResponseDto();
        dto.id = topic.topicId;
        dto.topic = topic.topic.title;
        return dto;
      });
    }

}
