import { SkillTypeEnum } from 'src/common/enum/skill-type.enum';
import {
    Column,
    Entity,
    PrimaryGeneratedColumn
} from 'typeorm';
import { CertificationTier } from './certification-tier.enum';

@Entity('certification_tracks')
export class CertificationTrack {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({
        type: 'integer',
        nullable: true,
        default: null,
    })
    skillId: number;

    @Column({
        type: 'enum',
        enum: SkillTypeEnum,
        default: SkillTypeEnum.SUBJECT,
    })
    skillType: SkillTypeEnum;

    @Column({
        type: 'enum',
        enum: CertificationTier,
        default: CertificationTier.EXPLORER,
    })
    tier: CertificationTier;

    @Column('float')
    minPercentage: number;

    @Column('float')
    maxPercentage: number;

    @Column({ nullable: true })
    minAttempts: number;

    @Column({ nullable: true })
    description: string;
}