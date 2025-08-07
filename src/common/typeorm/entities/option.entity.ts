import { Column, Entity } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { IOption } from '../interface/option.interface';
import { AuditEntity } from './audit.entity';

@Entity()
export class Option extends AbstractEntity implements IOption {
  @Column({ type: 'varchar', length: 100, nullable: false })
  option: string;

  @Column({ default: false })
  correct: boolean;

  @Column({
    type: 'varchar',
    nullable: true,
    default: null,
    length: 200,
  })
  comment: string;

  @Column((type) => AuditEntity, { prefix: '' })
  audit: AuditEntity;
}
