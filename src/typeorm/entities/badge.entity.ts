import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn
} from 'typeorm';
import { Subject } from './subject.entity';
//import { User } from './user.entity';

@Entity({ name: 'badge' })
export class Badge {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    @MaxLength(30)
    @Transform(({ value }) => value.trim())
    @Column({ type:"varchar", length: 30})
    name: string;

    @IsNotEmpty()
    @IsString()
    @MinLength(10)
    @MaxLength(100)
    @Column({ type:"varchar", length: 100})
    description: string;

    @Column({ type:"varchar", length: 100})
    content: string;

    @IsNotEmpty()
    @IsString()
    @Column({ type:"varchar", length: 1000})
    icon_url: string;

    @CreateDateColumn()
    createdAt: Date;
    
    // @ManyToMany(() => User)
    // users: User[];

    constructor(data: Partial<Badge> = {}) {
        Object.assign(this, data);
    }
}
