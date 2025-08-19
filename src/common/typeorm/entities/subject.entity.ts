import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, UpdateDateColumn } from 'typeorm';
import { ISubject } from '../interface/subject.interface';
import { AbstractEntity } from './abstract.entity';
import { JobRole } from './job-role.entity';

@Entity()
export class Subject extends AbstractEntity implements ISubject {
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  title: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  description: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  body: string;

  @Column({
    type: 'varchar',
    length: 100,
    nullable: true,
  })
  scope: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  image: string;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true,
  })
  color: string;

  @Column({
    type: 'boolean',
    default: true,
  })
  isPublished: boolean;

  @Column({ name: 'createdBy', default: null, select: false })
  createdBy: number;

  @Column({ name: 'updatedBy', default: null, select: false })
  updatedBy: number;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt', select: false })
  updatedAt: Date;

  // @ManyToMany(() => JobRole, (jobRole) => jobRole.subjects)
  // @JoinTable({
  //   name: 'job_role_subject',
  //   joinColumn: { name: 'subject_id', referencedColumnName: 'id' },
  //   inverseJoinColumn: { name: 'job_role_id', referencedColumnName: 'id' },
  // })
  // jobRoles: JobRole[];
}
