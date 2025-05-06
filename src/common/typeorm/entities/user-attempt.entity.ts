import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    ManyToMany,
    JoinTable,
  } from 'typeorm';
//import { User } from './user.entity';
import { Question } from './question.entity';
import { Option } from './option.entity';
  
  @Entity()
  export class UserAttempt {
    @PrimaryGeneratedColumn()
    id: number;
  
    // @ManyToOne(() => User, (user) => user.attempts)
    // user: User;
  
    @ManyToOne(() => Question, (question) => question.id)
    question: Question;
  
    @ManyToMany(() => Option)
    @JoinTable()
    selectedOptions: Option[];
  
    @Column({ default: false })
    isCorrect: boolean;
  
    @Column('timestamp', { default: () => 'CURRENT_TIMESTAMP' })
    attemptedAt: Date;
  }  