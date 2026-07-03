import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { CertificateStatusEnum } from 'src/common/enum/certificate-status.enum';
import { AbstractEntity } from './abstract.entity';
import { CertificationTrack } from './certification-track.entity';
import { User } from './user.entity';

@Unique(['userId', 'certificationTrackId'])
@Entity()
export class Certificate extends AbstractEntity {
  @Column({ type: 'varchar', length: 100, unique: true, nullable: false })
  certificateNumber: string;

  @Column({ type: 'integer', nullable: false })
  userId: number;

  @Column({ type: 'integer', nullable: false })
  certificationTrackId: number;

  @Column({
    type: 'enum',
    enum: CertificateStatusEnum,
    default: CertificateStatusEnum.ISSUED,
  })
  status: CertificateStatusEnum;

  @Column({ type: 'datetime', nullable: false, default: () => 'CURRENT_TIMESTAMP' })
  issuedAt: Date;

  @Column({ type: 'datetime', nullable: true, default: null })
  expiresAt: Date;

  @Column({ type: 'varchar', length: 255, nullable: true, default: null })
  pdfUrl: string;

  @Column({ type: 'varchar', length: 100, nullable: true, default: null })
  verificationCode: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', select: false })
  updatedAt: Date;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => CertificationTrack, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'certificationTrackId' })
  certificationTrack: CertificationTrack;
}
