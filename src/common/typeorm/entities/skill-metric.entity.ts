import { Column, Entity } from "typeorm";
import { AbstractEntity } from "./abstract.entity";

@Entity()
export class SkillMetric extends AbstractEntity {

  @Column()
  title: string;

  @Column({
    default: 5,
  })
  maxScore: number;

  @Column({
    default: true,
  })
  isActive: boolean;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  category?: string;

  @Column({ default: false })
  isRequired?: boolean;
}