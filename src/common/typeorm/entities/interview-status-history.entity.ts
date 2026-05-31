import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne } from "typeorm";
import { AbstractEntity } from "./abstract.entity";
import { User } from "./user.entity";
import { Interview } from "./interview.entity";
import { InterviewStatusEnum } from "src/common/enum/interview-status.enum";

@Entity()
export class InterviewStatusHistory extends AbstractEntity {

  @Column()
  interviewId: number;
    
  @Column({
    type: 'enum',
    enum: InterviewStatusEnum,
  })
  oldStatus: InterviewStatusEnum;

  @Column({
    type: 'enum',
    enum: InterviewStatusEnum,
  })
  newStatus: InterviewStatusEnum;

  @Column()
  changedBy: number;

  @Column({
    nullable: true,
  })
  remarks?: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(
    () => Interview,
    (interview) => interview.statusHistory,
  )
  @JoinColumn({
    name: 'interviewId',
  })
  interview: Interview;

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'changedBy',
  })
  changedByUser: User;
}