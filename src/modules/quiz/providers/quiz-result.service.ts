import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { QuizResult } from 'src/common/typeorm/entities/quiz-result.entity';

@Injectable()
export class QuizResultService {
  constructor(
    @InjectRepository(QuizResult)
    private quizResultRepository: Repository<QuizResult>,
  ) { }

  
}
