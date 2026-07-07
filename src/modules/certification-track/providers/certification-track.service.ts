import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AppCustomException } from 'src/common/exceptions/app-custom-exception.filter';
import { CertificationTrack } from 'src/common/typeorm/entities/certification-track.entity';
import { CertificationTrackSubjectTrack } from 'src/common/typeorm/entities/certification-track-subject-track.entity';
import { SubjectTrackTopic } from 'src/common/typeorm/entities/subject-track-topic.entity';
import { Repository } from 'typeorm';
import { CertificationTrackResponseDto } from '../dtos/certification-track-response.dto';
import { CreateCertificationTrackDto } from '../dtos/create-certification-track.dto';
import { LinkSubjectTracksDto } from '../dtos/link-subject-tracks.dto';
import { UpdateCertificationTrackDto } from '../dtos/update-certification-track.dto';

@Injectable()
export class CertificationTrackService {
  constructor(
    @InjectRepository(CertificationTrack)
    private trackRepo: Repository<CertificationTrack>,
    @InjectRepository(CertificationTrackSubjectTrack)
    private ctStRepo: Repository<CertificationTrackSubjectTrack>,
    @InjectRepository(SubjectTrackTopic)
    private sttRepo: Repository<SubjectTrackTopic>,
  ) {}

  async create(dto: CreateCertificationTrackDto): Promise<CertificationTrackResponseDto> {
    const track = await this.trackRepo.save(this.trackRepo.create(dto));
    return this.toResponseDto(track.id);
  }

  async findAll(): Promise<CertificationTrackResponseDto[]> {
    const tracks = await this.trackRepo.find({
      order: { jobRoleId: 'ASC', sortOrder: 'ASC' },
    });
    return Promise.all(tracks.map((t) => this.toResponseDto(t.id)));
  }

  async findByJobRoleId(jobRoleId: number): Promise<CertificationTrackResponseDto[]> {
    const tracks = await this.trackRepo.find({
      where: { jobRoleId },
      order: { sortOrder: 'ASC' },
    });
    return Promise.all(tracks.map((t) => this.toResponseDto(t.id)));
  }

  async findOne(id: number): Promise<CertificationTrackResponseDto> {
    await this.assertExists(id);
    return this.toResponseDto(id);
  }

  async update(id: number, dto: UpdateCertificationTrackDto): Promise<CertificationTrackResponseDto> {
    await this.assertExists(id);
    await this.trackRepo.update(id, dto);
    return this.toResponseDto(id);
  }

  async remove(id: number): Promise<void> {
    await this.assertExists(id);
    await this.trackRepo.delete(id);
  }

  async linkSubjectTracks(id: number, dto: LinkSubjectTracksDto): Promise<CertificationTrackResponseDto> {
    await this.assertExists(id);
    for (const subjectTrackId of dto.subjectTrackIds) {
      const exists = await this.ctStRepo.findOne({
        where: { certificationTrackId: id, subjectTrackId },
      });
      if (!exists) {
        await this.ctStRepo.save(
          this.ctStRepo.create({ certificationTrackId: id, subjectTrackId }),
        );
      }
    }
    return this.toResponseDto(id);
  }

  async unlinkSubjectTrack(id: number, subjectTrackId: number): Promise<void> {
    await this.assertExists(id);
    await this.ctStRepo.delete({ certificationTrackId: id, subjectTrackId });
  }

  private async assertExists(id: number): Promise<CertificationTrack> {
    const track = await this.trackRepo.findOne({ where: { id } });
    if (!track) {
      throw new AppCustomException(HttpStatus.NOT_FOUND, `CertificationTrack ID ${id} not found`);
    }
    return track;
  }

  private async toResponseDto(id: number): Promise<CertificationTrackResponseDto> {
    const track = await this.trackRepo.findOne({
      where: { id },
      relations: ['jobRole'],
    });
    const links = await this.ctStRepo.find({
      where: { certificationTrackId: id },
      relations: ['subjectTrack', 'subjectTrack.subject'],
    });

    const subjectTracks = await Promise.all(
      links.map(async (link) => {
        const st = link.subjectTrack;
        const topicCount = await this.sttRepo.count({
          where: { subjectTrackId: st.id },
        });
        return {
          id: st.id,
          title: st.title,
          slug: st.slug,
          subjectId: st.subjectId,
          subjectName: st.subject?.title ?? '',
          topicCount,
        };
      }),
    );

    return {
      id: track.id,
      jobRoleId: track.jobRoleId,
      jobRoleTitle: (track as any).jobRole?.title ?? '',
      title: track.title,
      description: track.description,
      sortOrder: track.sortOrder,
      isPublished: track.isPublished,
      subjectTrackCount: subjectTracks.length,
      subjectTracks,
    };
  }
}
