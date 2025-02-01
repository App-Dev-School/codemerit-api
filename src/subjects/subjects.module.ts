import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from 'src/typeorm/entities/subject.entity';

@Module({
  controllers: [],
  imports: [TypeOrmModule.forFeature([Subject])],
  providers: [],
  exports: [],
})
export class SubjectsModule {}
