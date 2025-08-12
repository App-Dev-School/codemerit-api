import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Question } from 'src/common/typeorm/entities/question.entity';
import { TriviaService } from './providers/trivia.service';
import { TriviaController } from './trivia.controller';
import { TriviaOptionService } from './providers/trivia-option.service';
import { TriviaTopicService } from './providers/trivia-topic.service';
import { TriviaOption } from 'src/common/typeorm/entities/trivia-option.entity';
import { TriviaTopic } from 'src/common/typeorm/entities/trivia-topic.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Question, TriviaOption, TriviaTopic])],
  providers: [TriviaService, TriviaOptionService, TriviaTopicService],
  controllers: [TriviaController],
})
export class TriviaModule {}
