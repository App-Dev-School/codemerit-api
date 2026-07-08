import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppCustomException } from 'src/common/exceptions/app-custom-exception.filter';
import { SubjectTrack } from 'src/common/typeorm/entities/subject-track.entity';
import { SubjectTrackTopic } from 'src/common/typeorm/entities/subject-track-topic.entity';
import { generateSlug, generateUniqueSlug } from 'src/common/utils/slugify.util';
import { Repository } from 'typeorm';
import { CreateSubjectTrackDto } from '../dtos/create-subject-track.dto';
import { LinkTopicsDto } from '../dtos/link-topics.dto';
import { SubjectTrackResponseDto } from '../dtos/subject-track-response.dto';
import { UpdateSubjectTrackDto } from '../dtos/update-subject-track.dto';

@Injectable()
export class SubjectTrackService {
  constructor(
    @InjectRepository(SubjectTrack)
    private trackRepo: Repository<SubjectTrack>,
    @InjectRepository(SubjectTrackTopic)
    private sttRepo: Repository<SubjectTrackTopic>,
  ) {}

  async create(dto: CreateSubjectTrackDto): Promise<SubjectTrackResponseDto> {
    let slug = generateSlug(dto.title);
    let existing = await this.trackRepo.findOne({ where: { slug } });
    while (existing) {
      slug = generateUniqueSlug(dto.title);
      existing = await this.trackRepo.findOne({ where: { slug } });
    }

    const track = await this.trackRepo.save(
      this.trackRepo.create({ ...dto, slug }),
    );
    return this.toResponseDto(track.id);
  }

  async findAll(): Promise<SubjectTrackResponseDto[]> {
    const tracks = await this.trackRepo.find({
      relations: ['subject'],
      order: { subjectId: 'ASC', sortOrder: 'ASC' },
    });
    return Promise.all(tracks.map((t) => this.toResponseDto(t.id)));
  }

  async findBySubjectId(subjectId: number): Promise<SubjectTrackResponseDto[]> {
    const tracks = await this.trackRepo.find({
      where: { subjectId },
      relations: ['subject'],
      order: { sortOrder: 'ASC' },
    });
    return Promise.all(tracks.map((t) => this.toResponseDto(t.id)));
  }

  async findOne(id: number): Promise<SubjectTrackResponseDto> {
    await this.assertExists(id);
    return this.toResponseDto(id);
  }

  async update(id: number, dto: UpdateSubjectTrackDto): Promise<SubjectTrackResponseDto> {
    await this.assertExists(id);
    await this.trackRepo.update(id, dto);
    return this.toResponseDto(id);
  }

  async remove(id: number): Promise<void> {
    await this.assertExists(id);
    await this.trackRepo.delete(id);
  }

  async linkTopics(id: number, dto: LinkTopicsDto): Promise<SubjectTrackResponseDto> {
    await this.assertExists(id);
    for (const topicId of dto.topicIds) {
      const exists = await this.sttRepo.findOne({
        where: { subjectTrackId: id, topicId },
      });
      if (!exists) {
        await this.sttRepo.save(this.sttRepo.create({ subjectTrackId: id, topicId }));
      }
    }
    return this.toResponseDto(id);
  }

  async unlinkTopic(id: number, topicId: number): Promise<void> {
    await this.assertExists(id);
    await this.sttRepo.delete({ subjectTrackId: id, topicId });
  }

  private async assertExists(id: number): Promise<SubjectTrack> {
    const track = await this.trackRepo.findOne({ where: { id } });
    if (!track) {
      throw new AppCustomException(HttpStatus.NOT_FOUND, `SubjectTrack ID ${id} not found`);
    }
    return track;
  }

  private async toResponseDto(id: number): Promise<SubjectTrackResponseDto> {
    const track = await this.trackRepo.findOne({
      where: { id },
      relations: ['subject'],
    });
    const topicLinks = await this.sttRepo.find({
      where: { subjectTrackId: id },
      relations: ['topic'],
    });

    return {
      id: track.id,
      subjectId: track.subjectId,
      subjectName: track.subject?.title ?? '',
      title: track.title,
      slug: track.slug,
      description: track.description,
      sortOrder: track.sortOrder,
      isPublished: track.isPublished,
      topicCount: topicLinks.length,
      topics: topicLinks.map((stt) => ({
        id: stt.topic.id,
        title: stt.topic.title,
        slug: stt.topic.slug,
        label: stt.topic.label,
      })),
    };
  }
}
