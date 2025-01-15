import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    OneToMany,
    PrimaryGeneratedColumn
} from 'typeorm';
import { Topic } from './topic.entity';

@Entity({ name: 'subjects' })
export class Subject {
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
    
    // @ManyToMany((type) => Topic, (subject) => subject.topics)
    // topics: Topic[]
    
    constructor(data: Partial<Subject> = {}) {
        Object.assign(this, data);
    }
}
