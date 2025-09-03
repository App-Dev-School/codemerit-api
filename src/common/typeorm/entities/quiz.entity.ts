import { QuizTypeEnum } from 'src/common/enum/quiz-type.enum';
import { TopicLabelEnum } from 'src/common/enum/topic-label.enum';
import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToMany,
    ManyToOne,
    OneToMany,
    UpdateDateColumn
} from 'typeorm';
import { IQuiz } from '../interface/quiz.interface';
import { AbstractEntity } from './abstract.entity';
import { QuizQuestion } from './quiz-quesion.entity';
import { User } from './user.entity';

@Entity()
export class Quiz extends AbstractEntity implements IQuiz {
    @Column({
        type: 'varchar',
        length: 200,
        nullable: false,
    })
    title: string;

    // @Column({
    //     type: 'integer',
    //     name: 'subjectId',
    //     nullable: false,
    // })
    // subjectId: number;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
        default: null,
    })
    image: string;

    @Column({
        type: 'enum',
        enum: TopicLabelEnum,
        nullable: false,
        default: TopicLabelEnum.Foundation,
    })
    label: TopicLabelEnum;

    @Column({
        type: 'varchar',
        length: 200,
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
        type: 'varchar',
        length: 200,
        nullable: true,
        default: null,
    })
    description: string;

    @Column({
        type: 'varchar',
        length: 100,
        nullable: true,
        default: null,
    })
    goal: string;

    @Column({
        type: 'varchar',
        length: 20,
        nullable: true,
        default: null,
    })
    tag: string;

    @Column({ name: 'createdBy', default: null, select: false })
    createdBy: number;

    @Column({ name: 'updatedBy', default: null, select: false })
    updatedBy: number;

    @CreateDateColumn({ name: 'createdAt' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt', select: false })
    updatedAt: Date;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'createdBy', referencedColumnName: 'id' })
    userCreatedBy: User;

    // @ManyToOne(() => Subject)
    // @JoinColumn({ name: 'subjectId' })
    // subject: Subject;

    @OneToMany(() => QuizQuestion, (quizQuestion) => quizQuestion.quiz, { cascade: true })
    quizQuestions: QuizQuestion[];

    //Map for relation with one JobRole
    //Map for relation with one/many Topic
    //Map for relation with one/many Questions
}
