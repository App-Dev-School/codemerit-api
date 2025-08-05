import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'hint' })
export class Hint {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @IsNotEmpty()
  @IsString()
  @MaxLength(500)
  @Column({ type: 'varchar', length: 500 })
  text: string;

  @CreateDateColumn()
  createdAt: Date;

  constructor(data: Partial<Hint> = {}) {
    Object.assign(this, data);
  }
}
