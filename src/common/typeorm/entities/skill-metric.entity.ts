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
}