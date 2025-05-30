import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from './abstract.entity';
import { ITriviaOption } from '../interface/trivia-option.interface';
import { Option } from './option.entity';
import { Trivia } from './trivia.entity';

@Entity()
export class TriviaOption extends AbstractEntity implements ITriviaOption {  
  @Column({
    type: 'integer',
    nullable: false,
  })
  triviaId: number;
  
   @Column({
    type: 'integer',
    nullable: false,
  })
  optionId: number;

  @ManyToOne(() => Option, { eager: true })
  @JoinColumn({ name: 'optionId', referencedColumnName: 'id' })
  option: Option;

  // @ManyToOne(() => Trivia, { eager: true })
  // @JoinColumn({ name: 'triviaId', referencedColumnName: 'id' })
  // trivia: Trivia;
}
