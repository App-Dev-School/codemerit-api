import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonSection } from 'src/common/typeorm/entities/lesson-section.entity';
import { Lesson } from 'src/common/typeorm/entities/lesson.entity';
import { UserPermissionModule } from '../user-permission/user-permission.module';
import { LessonController } from './lesson.controller';
import { LessonService } from './providers/lesson.service';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson, LessonSection]), UserPermissionModule],
  providers: [LessonService],
  controllers: [LessonController],
  exports: [TypeOrmModule, LessonService],
})
export class LessonModule {}
