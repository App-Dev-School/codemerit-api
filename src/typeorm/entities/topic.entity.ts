import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn
} from 'typeorm';
import { Subject } from './subject.entity';
import { Question } from './question.entity';

@Entity({ name: 'topic' })
export class Topic {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    @MaxLength(30)
    @Transform(({ value }) => value.trim())
    @Column({ type:"varchar", length: 30})
    name: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(10)
    @MaxLength(100)
    @Column({ type:"varchar", length: 100})
    description: string;

    @CreateDateColumn()
    createdAt: Date;
    
    @ManyToOne(() => Subject, (subject) => subject.topics)
    subject: Subject

    @OneToMany(() => Question, (question) => question.topic)
    questions: Question[];
  
    constructor(data: Partial<Topic> = {}) {
        Object.assign(this, data);
    }
}
