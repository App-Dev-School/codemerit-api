import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  Unique,
} from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { CertificationTrack } from './certification-track.entity';
import { SubjectTrack } from './subject-track.entity';

@Unique(['certificationTrackId', 'subjectTrackId'])
@Entity()
export class CertificationTrackSubjectTrack extends AbstractEntity {
  @Column({ type: 'integer', nullable: false })
  certificationTrackId: number;

  @Column({ type: 'integer', nullable: false })
  subjectTrackId: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @ManyToOne(() => CertificationTrack, (ct) => ct.certificationTrackSubjectTracks, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'certificationTrackId' })
  certificationTrack: CertificationTrack;

  @ManyToOne(() => SubjectTrack, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subjectTrackId' })
  subjectTrack: SubjectTrack;
}
