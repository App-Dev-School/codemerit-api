import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn
} from 'typeorm';
import { Question } from './question.entity';

@Entity({ name: 'option' })
export class Option {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    @Column({ type: "varchar", length: 100 })
    name: string;

    @Column({ default: false })
    isCorrect: boolean;

    @ManyToOne(() => Question, (question) => question.options)
    question: Question;

    constructor(data: Partial<Option> = {}) {
        Object.assign(this, data);
    }
}