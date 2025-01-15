import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Subject } from 'rxjs';
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    PrimaryGeneratedColumn
} from 'typeorm';

@Entity({ name: 'topics' })
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
    
    // @ManyToMany((type) => Subject, (subject) => subject.topics)
    // subjects: Subject[]

    constructor(data: Partial<Topic> = {}) {
        Object.assign(this, data);
    }
}
