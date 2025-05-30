import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TriviaOption } from 'src/common/typeorm/entities/trivia-option.entity';
import { QuestionOptionResponseDto } from '../dtos/question-option-response.dto';

@Injectable()
export class TriviaOptionService {
  constructor(
    @InjectRepository(TriviaOption)
    private triviaOptionRepo: Repository<TriviaOption>,
  ) {}

    async findOne(id: number): Promise<TriviaOption | undefined> {
      return this.triviaOptionRepo.findOne({ where: { id } });
    }
    
        async findTriviaOptionsByTriviaId(triviaId: number): Promise<QuestionOptionResponseDto[] | null> {
          const options = await this.triviaOptionRepo.find({ where: { triviaId } });
          if (!options || options.length === 0) {
            return null;
          }
          return options.map(option => {
            const dto = new QuestionOptionResponseDto();
            dto.id = option.id;
            dto.option = option.option.option;
            dto.correct = option.option.correct;
            dto.comment = option.option.comment;
            return dto;
          });
        }
}
