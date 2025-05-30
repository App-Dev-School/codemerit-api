import { Module } from '@nestjs/common';
import { SubjectsModule } from './subjects/subjects.module';
import { TopicsModule } from './topics/topics.module';
import { TriviaModule } from './trivia/trivia.module';

@Module({
  imports: [SubjectsModule, TriviaModule, TopicsModule],
})
export class DomainModule {}
