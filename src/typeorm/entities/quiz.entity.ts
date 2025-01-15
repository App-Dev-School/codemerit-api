import { Exclude, Expose, Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { Role } from 'src/auth/utilities/role.enum';
import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from 'typeorm';

@Entity({ name: 'quizzes' })
export class Quiz {
    @PrimaryGeneratedColumn({ type: 'int' })
    id: number;

    @IsNotEmpty()
    @IsString()
    @MinLength(5)
    @MaxLength(100)
    @Transform(({ value }) => value.trim())
    @Column({ type:"varchar", length: 20})
    title: string;

    @IsString()
    @Column({ type:"varchar", length: 20, nullable: true})
    description: string;

    @IsNotEmpty()
    @IsEmail()
    @Expose()
    @Column({ type:"varchar", length: 50, unique: true })
    email: string;

    @IsNotEmpty()
    @IsEnum(Role)
    @Column({ type:"varchar", length: 10})
    roles: string;

    @IsNotEmpty()
    @IsString()
    @Column({ unique: true })
    username: string;

    @IsString()
    @Column({type:"varchar", length: 100})
    @Exclude()
    password: string;

    @Column()
    salt: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
    
    @IsString()
    @Column({ type:"varchar", length: 500, nullable: true})
    refreshToken: string;
    
    constructor(data: Partial<Quiz> = {}) {
        Object.assign(this, data);
    }
}
