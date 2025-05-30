import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn
} from 'typeorm';
import { Question } from './question.entity';

@Entity({ name: 'hint' })
export class Hint {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @IsNotEmpty()
    @IsString()
    @MaxLength(500)
    @Column({ type:"varchar", length: 500})
    text: string;

    @CreateDateColumn()
    createdAt: Date;

    @ManyToOne(() => Question, (question) => question.hints)
    question: Question;
  
    constructor(data: Partial<Hint> = {}) {
        Object.assign(this, data);
    }
}