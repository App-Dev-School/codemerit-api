import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { IOption } from '../interface/option.interface';
import { TriviaOption } from './trivia-option.entity';
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
    length: 200
  })
  comment: string;

  @Column(type => AuditEntity)
  audit: AuditEntity;
  // @ManyToOne(() => Trivia, trivia => trivia.options)
  // @JoinColumn({ name: 'question_id' })
  // question: Question;
  
  // @OneToMany(() => TriviaOption, triviaOption => triviaOption.option)
  // triviaOptions: TriviaOption[];
}
