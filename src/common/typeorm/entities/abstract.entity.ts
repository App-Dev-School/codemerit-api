// import { Exclude } from "class-transformer";
import { PrimaryGeneratedColumn, Column } from 'typeorm';
import { AuditEntity } from './audit.entity';

export abstract class AbstractEntity{
  @PrimaryGeneratedColumn()
  public id: number;

  // @Column({ name: 'is_active', default: true })
  // isActive: boolean;

  // @Column({ name: 'remarks', default: null, select: false })
  // remarks: string;
}
