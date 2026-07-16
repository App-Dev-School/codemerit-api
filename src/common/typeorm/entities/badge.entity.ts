import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'badge' })
export class Badge {
  @PrimaryGeneratedColumn({ type: 'int' })
  id: number;

  @Column({ type: 'varchar', length: 50, unique: true, nullable: false })
  code: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(30)
  @Transform(({ value }) => value.trim())
  @Column({ type: 'varchar', length: 30 })
  name: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(100)
  @Column({ type: 'varchar', length: 100 })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  content: string;

  @IsNotEmpty()
  @IsString()
  @Column({ type: 'varchar', length: 1000 })
  iconUrl: string;

  @Column({ type: 'int', default: 0 })
  points: number;

  @CreateDateColumn()
  createdAt: Date;

  constructor(data: Partial<Badge> = {}) {
    Object.assign(this, data);
  }
}
