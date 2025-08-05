import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn('increment')
    id: number;
  
    @Column()
    userId: number;
  
    @Column('linkedinUrl')
    linkedinUrl: string;

    @Column()
    selfRatingDone: boolean;

    @Column()
    playedQuiz: boolean;

    @Column()
    takenInterview: boolean;

    @Column()
    level1Assessment: boolean;
    
    @Column()
    level2Assessment: boolean;
  
    @OneToOne(type => User)
    @JoinColumn()
    user: User;
}