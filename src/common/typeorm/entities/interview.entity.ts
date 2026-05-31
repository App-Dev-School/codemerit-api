import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, UpdateDateColumn } from "typeorm";
import { AssessmentSession } from "./assessment-session.entity";
import { JobRole } from "./job-role.entity";
import { AbstractEntity } from "./abstract.entity";
import { User } from "./user.entity";
import { InterviewStatusHistory } from "./interview-status-history.entity";
import { InterviewStatusEnum } from "src/common/enum/interview-status.enum";

@Entity()
export class Interview extends AbstractEntity {
  @Column({
    unique: true,
    length: 10,
  })
  interviewCode: string;

  @Column()
  title: string;

  @Column()
  userId: number;

  //extrernal tracking Id
  @Column({
    nullable: true,
  })
  externalId?: string;

  @Column()
  jobRoleId: number;

  @Column({
    type: 'timestamp',
  })
  scheduledAt: Date;

  @Column({
    type: 'enum',
    enum: InterviewStatusEnum,
    default: InterviewStatusEnum.SCHEDULED,
  })
  status: InterviewStatusEnum;

  @Column({
    type: 'text',
    nullable: true,
  })
  feedback?: string;

  @Column({
    type: 'text',
    nullable: true,
  })
  declineReason?: string;

  @Column({
    nullable: true,
  })
  completedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  /*
   * Relations
   */

  @ManyToOne(() => User)
  @JoinColumn({
    name: 'userId',
  })
  user: User;

  @ManyToOne(() => JobRole)
  @JoinColumn({
    name: 'jobRoleId',
  })
  jobRole: JobRole;

  @OneToMany(
    () => AssessmentSession,
    (assessment) => assessment.interview,
  )
  assessmentSessions: AssessmentSession[];

  @OneToMany(
    () => InterviewStatusHistory,
    (history) => history.interview,
  )
  statusHistory: InterviewStatusHistory[];
}