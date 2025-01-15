import { Exclude, Expose, Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Level } from 'src/auth/utilities/level.enum';
import { Role } from 'src/auth/utilities/role.enum';
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

@Entity({ name: 'question' })
export class Question {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @Transform(({ value }) => value.trim())
    @Column({ type:"varchar", length: 200})
    question: string;

    @IsNotEmpty()
    @IsEnum(Level)
    @Column({ type:"varchar", length: 10})
    level: string = Level.Easy;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
    
    constructor(data: Partial<Question> = {}) {
        Object.assign(this, data);
    }
}
