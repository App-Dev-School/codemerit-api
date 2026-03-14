import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn
} from 'typeorm';
import { User } from './user.entity';
import { CertificationTrack } from './certification-track.entity';
@Entity('certificates')
export class Certificate {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    certificateNumber: string;

    //keep as userId
    @ManyToOne(() => User)
    user: User;

    @ManyToOne(() => CertificationTrack)
    track: CertificationTrack;

    @Column()
    status: string;
    // ISSUED | REVOKED | EXPIRED

    //add audit fields
    //   @Column({ nullable: true })
    //   issuedAt: Date;

    //   @Column({ nullable: true })
    //   expiresAt: Date;

    @Column({ nullable: true })
    pdfUrl: string;

    /* Template stored directly */
    //   @Column({ type: 'text', nullable: true })
    //   htmlTemplate: string;

    //   @Column({ type: 'jsonb', nullable: true })
    //   styleConfig: Record<string, any>;

    @Column({ nullable: true })
    verificationCode: string;
}