import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { QuestionAttempt } from 'src/common/typeorm/entities/question-attempt.entity';

@Injectable()
export class QuestionAttemptService {
  constructor(
    @InjectRepository(QuestionAttempt)
    private questionAttemptRepository: Repository<QuestionAttempt>,
  ) { }
}
