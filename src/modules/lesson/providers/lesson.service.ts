import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppCustomException } from 'src/common/exceptions/app-custom-exception.filter';
import { LessonSection } from 'src/common/typeorm/entities/lesson-section.entity';
import { Lesson } from 'src/common/typeorm/entities/lesson.entity';
import {
  generateSlug,
  generateUniqueSlug,
} from 'src/common/utils/slugify.util';
import { DataSource, Repository } from 'typeorm';
import { CreateLessonDto } from '../dtos/create-lesson.dto';

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    private readonly dataSource: DataSource,
  ) {}


  async createLesson(dto: CreateLessonDto, userId: number): Promise<Lesson> {
    const subjectId = dto.subjectId ?? dto.subject;
    const topicId = dto.topicId ?? dto.topic;

    if (!subjectId) {
      throw new AppCustomException(
        HttpStatus.BAD_REQUEST,
        'Lesson subject is required.',
      );
    }

    if (!topicId) {
      throw new AppCustomException(
        HttpStatus.BAD_REQUEST,
        'Lesson topic is required.',
      );
    }

    if (!dto.descriptions?.length) {
      throw new AppCustomException(
        HttpStatus.BAD_REQUEST,
        'At least one lesson description is required.',
      );
    }

    return this.dataSource.transaction(async (manager) => {
      let slug = generateSlug(dto.title);
      let existingSlug = await manager.findOne(Lesson, { where: { slug } });

      while (existingSlug) {
        slug = generateUniqueSlug(dto.title);
        existingSlug = await manager.findOne(Lesson, { where: { slug } });
      }

      const lesson = manager.create(Lesson, {
        title: dto.title,
        subjectId,
        topicId,
        slug,
        level: dto.level,
        userId,
      });

      const savedLesson = await manager.save(Lesson, lesson);

      const sections = dto.descriptions.map((description, index) =>
        manager.create(LessonSection, {
          lessonId: savedLesson.id,
          title: `Description ${index + 1}`,
          description,
        }),
      );

      await manager.save(LessonSection, sections);

      return manager.findOne(Lesson, {
        where: { id: savedLesson.id },
        relations: ['sections'],
      });
    });
  }

}
