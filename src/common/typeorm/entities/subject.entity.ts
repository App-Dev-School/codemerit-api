import { Entity, Column } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { ISubject } from '../interface/subject.interface';
import { AuditEntity } from './audit.entity';

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
  
    @Column(type => AuditEntity)
    audit: AuditEntity;
}
