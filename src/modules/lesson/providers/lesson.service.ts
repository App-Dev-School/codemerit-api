import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppCustomException } from 'src/common/exceptions/app-custom-exception.filter';
import { LessonSection } from 'src/common/typeorm/entities/lesson-section.entity';
import { Lesson } from 'src/common/typeorm/entities/lesson.entity';
import { UserSubject } from 'src/common/typeorm/entities/user-subject.entity';
import {
  generateSlug,
  generateUniqueSlug,
} from 'src/common/utils/slugify.util';
import { DataSource, Repository } from 'typeorm';
import { CreateLessonDto } from '../dtos/create-lesson.dto';
import { GetLessonsDto } from '../dtos/get-lessons.dto';

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
    private readonly dataSource: DataSource,
  ) {}

  async findLessons(dto: GetLessonsDto, userId?: number): Promise<any[]> {
    const limit = Number(dto?.n ?? 10);
    const fetchAll = dto?.fetch === 'all';

    if (!userId) {
      const lessons = await this.getRandomLessons(limit);
      return lessons.map((lesson) => ({
        ...lesson,
        subject: lesson.subject
          ? {
              id: lesson.subject.id,
              title: lesson.subject.title,
              image: lesson.subject.image,
            }
          : null,
        topic: lesson.topic
          ? {
              id: lesson.topic.id,
              title: lesson.topic.title,
              image: lesson.topic.image,
            }
          : null,
        user: lesson.user
          ? {
              id: lesson.user.id,
              firstName: lesson.user.firstName,
              lastName: lesson.user.lastName,
            }
          : null,
        sections: lesson.sections || [],
      }));
    }

    const enrolledSubjectIds = await this.getUserSubjectIds(userId);

    if (!enrolledSubjectIds.length) {
      if (!fetchAll) {
        return [];
      }

      const lessons = await this.getRandomLessons(limit);
      return lessons.map((lesson) => ({
        ...lesson,
        subject: lesson.subject
          ? {
              id: lesson.subject.id,
              title: lesson.subject.title,
              image: lesson.subject.image,
            }
          : null,
        topic: lesson.topic
          ? {
              id: lesson.topic.id,
              title: lesson.topic.title,
              image: lesson.topic.image,
            }
          : null,
        user: lesson.user
          ? {
              id: lesson.user.id,
              firstName: lesson.user.firstName,
              lastName: lesson.user.lastName,
            }
          : null,
        sections: lesson.sections || [],
      }));
    }

    const relevantLessons = await this.getRandomLessonsBySubjects(
      enrolledSubjectIds,
      limit,
    );

    if (!fetchAll || relevantLessons.length >= limit) {
      return relevantLessons.map((lesson) => ({
        ...lesson,
        subject: lesson.subject
          ? {
              id: lesson.subject.id,
              title: lesson.subject.title,
              image: lesson.subject.image,
            }
          : null,
        topic: lesson.topic
          ? {
              id: lesson.topic.id,
              title: lesson.topic.title,
              image: lesson.topic.image,
            }
          : null,
        user: lesson.user
          ? {
              id: lesson.user.id,
              firstName: lesson.user.firstName,
              lastName: lesson.user.lastName,
            }
          : null,
        sections: lesson.sections || [],
      }));
    }

    const remaining = limit - relevantLessons.length;
    const existingIds = relevantLessons.map((lesson) => lesson.id);
    const fillerLessons = await this.getRandomLessons(remaining, existingIds);

    return [...relevantLessons, ...fillerLessons].map((lesson) => ({
      ...lesson,
      subject: lesson.subject
        ? {
            id: lesson.subject.id,
            title: lesson.subject.title,
            image: lesson.subject.image,
          }
        : null,
      topic: lesson.topic
        ? {
            id: lesson.topic.id,
            title: lesson.topic.title,
            image: lesson.topic.image,
          }
        : null,
      user: lesson.user
        ? {
            id: lesson.user.id,
            firstName: lesson.user.firstName,
            lastName: lesson.user.lastName,
          }
        : null,
      sections: lesson.sections || [],
    }));
  }

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

  private async getUserSubjectIds(userId: number): Promise<number[]> {
    const userSubjects = await this.dataSource
      .getRepository(UserSubject)
      .find({ where: { userId } });

    return userSubjects.map((item) => item.subjectId);
  }

  private getRandomLessons(limit: number, excludeIds: number[] = []) {
    const query = this.lessonRepository
      .createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.subject', 'subject')
      .leftJoinAndSelect('lesson.topic', 'topic')
      .leftJoinAndSelect('lesson.user', 'user')
      .leftJoinAndSelect('lesson.sections', 'sections')
      .orderBy('RAND()')
      .take(limit);

    if (excludeIds.length) {
      query.where('lesson.id NOT IN (:...excludeIds)', { excludeIds });
    }

    return query.getMany();
  }

  private getRandomLessonsBySubjects(subjectIds: number[], limit: number) {
    return this.lessonRepository
      .createQueryBuilder('lesson')
      .leftJoinAndSelect('lesson.subject', 'subject')
      .leftJoinAndSelect('lesson.topic', 'topic')
      .leftJoinAndSelect('lesson.user', 'user')
      .leftJoinAndSelect('lesson.sections', 'sections')
      .where('lesson.subjectId IN (:...subjectIds)', { subjectIds })
      .orderBy('RAND()')
      .take(limit)
      .getMany();
  }
}
