import { Transform } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { Level } from 'src/auth/utilities/level.enum';
import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';
import { Hint } from './hint.entity';
import { Topic } from './topic.entity';
import { Option } from './option.entity';

@Entity({ name: 'question' })
export class Question {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @IsNotEmpty()
    @IsString()
    @Transform(({ value }) => value.trim())
    @Column({ type: "varchar" })
    text: string;

    @IsNotEmpty()
    @IsEnum(Level)
    @Column({ type: "varchar", length: 10 })
    level: string = Level.Easy;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @ManyToOne(() => Topic, (topic) => topic.questions)
    topic: Topic;

    @OneToMany(() => Option, (option) => option.question)
    options: Option[];

    @OneToMany(() => Hint, (hint) => hint.question)
    hints: Hint[];

    constructor(data: Partial<Question> = {}) {
        Object.assign(this, data);
    }
}
