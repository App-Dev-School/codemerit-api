import { TopicLabel } from 'src/common/enum/TopicLabel.enum';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    UpdateDateColumn
} from 'typeorm';
import { IQuiz } from '../interface/quiz.interface';
import { AbstractEntity } from './abstract.entity';
import { Subject } from './subject.entity';
import { QuizTypeEnum } from 'src/common/enum/quiz-type.enum';

@Entity()
export class Quiz extends AbstractEntity implements IQuiz {
    @Column({
        type: 'varchar',
        length: 200,
        nullable: false,
    })
    title: string;

    @Column({
        type: 'integer',
        name: 'subjectId',
        nullable: false,
    })
    subjectId: number;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
        default: null,
    })
    image: string;

    @Column({
        type: 'enum',
        enum: TopicLabel,
        nullable: true,
        default: TopicLabel.Beginner,
    })
    label: TopicLabel;

    @Column({
        type: 'varchar',
        length: 20,
        nullable: true,
        default: null,
    })
    shortDesc: string;

    @Column({
        type: 'varchar',
        length: 100,
        nullable: true,
        unique: true,
    })
    slug: string;

    @Column({
        type: 'enum',
        nullable: false,
        enum: QuizTypeEnum,
        default: QuizTypeEnum.UserQuiz,
    })
    quizType: QuizTypeEnum;

    @Column({
        type: 'boolean',
        default: true,
    })
    isPublished: boolean;

    @Column({
        type: 'text',
        nullable: true,
        default: null,
    })
    description: string;

    @Column({
        type: 'text',
        nullable: true,
        default: null,
    })
    goal: string;

    @Column({
        type: 'int',
        default: 0,
    })
    numQuizzes: number;
    @Column({ name: 'createdBy', default: null, select: false })
    createdBy: number;

    @Column({ name: 'updatedBy', default: null, select: false })
    updatedBy: number;

    @CreateDateColumn({ name: 'createdAt' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt', select: false })
    updatedAt: Date;

    @ManyToOne(() => Subject)
    @JoinColumn({ name: 'subjectId' })
    subject: Subject;

    //Map for relation with one JobRole
    //Map for relation with one/many Topic
    //Map for relation with one/many Questions
}
