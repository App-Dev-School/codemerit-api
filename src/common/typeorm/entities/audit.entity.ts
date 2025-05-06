import {
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

export abstract class AuditEntity {
  @Column({ name: 'created_by', default: null, select: false })
  createdBy: number;

  @Column({ name: 'updated_by', default: null, select: false })
  updatedBy: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', default: null, select: false })
  deletedAt: Date;
}
