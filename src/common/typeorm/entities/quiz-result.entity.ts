import {
    Column,
    CreateDateColumn,
    Entity,
} from 'typeorm';
import { IQuizResult } from '../interface/quiz-result.interface';
import { AbstractEntity } from './abstract.entity';

@Entity()
export class QuizResult extends AbstractEntity implements IQuizResult {
    @Column({
        type: 'varchar',
        length: 10,
        nullable: false,
        unique: true
    })
    resultCode: string;

    @Column({
        type: 'integer',
        name: 'userId',
        nullable: false,
    })
    userId: number;

    @Column({
        type: 'integer',
        name: 'quizId',
        nullable: false,
    })
    quizId: number;

    @Column({
        type: 'integer',
        nullable: true,
        default:null
    })
    total: number;

    @Column({
        type: 'integer',
        nullable: true,
        default:null
    })
    correct: number;

    @Column({
        type: 'integer',
        nullable: true,
        default:null
    })
    wrong: number;

    @Column({
        type: 'integer',
        nullable: true,
        default:null
    })
    unanswered: number;

    @Column({
        type: 'integer',
        nullable: true,
        default:null
    })
    timeSpent: number;

    @Column({
        type: 'float',
        nullable: true,
        default:null
    })
    score: number;

    @Column({
        type: 'varchar',
        length: 255,
        nullable: true,
        default:null
    })
    remarks?: string;

    @CreateDateColumn()
    createdAt: Date;
    
}
