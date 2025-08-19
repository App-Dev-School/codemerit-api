import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { IJobSubject } from '../interface/job-subject.interface';
import { AbstractEntity } from './abstract.entity';
import { JobRole } from './job-role.entity';
import { Subject } from './subject.entity';

@Entity()
export class JobRoleSubject extends AbstractEntity implements IJobSubject {
  @Column({
    type: 'integer',
    nullable: false,
  })
  jobRoleId: number;

  @Column({
    type: 'integer',
    nullable: false,
  })
  subjectId: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @ManyToOne(() => JobRole, { eager: true })
  @JoinColumn({ name: 'jobRoleId', referencedColumnName: 'id' })
  jobRole: JobRole;

  @ManyToOne(() => Subject, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subjectId', referencedColumnName: 'id' })
  subject: Subject;
}
