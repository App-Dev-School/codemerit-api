import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Exclude, Expose, Transform } from 'class-transformer';
import { IsEmail, IsEnum, IsNotEmpty, IsString, Length, MaxLength, MinLength } from 'class-validator';
import { Role } from 'src/auth/utilities/role.enum';
import { LOG } from 'src/configs/constants';
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BeforeInsert,
    BeforeUpdate,
} from 'typeorm';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @IsNotEmpty()
    @IsString()
    @MinLength(2)
    @MaxLength(30)
    @Transform(({ value }) => value.trim())
    @Column({ type:"varchar", length: 20})
    firstName: string;

    @IsString()
    @Column({ type:"varchar", length: 20, nullable: true})
    lastName: string;

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
    
    constructor(data: Partial<User> = {}) {
        Object.assign(this, data);
    }

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword(): Promise<void> {
        try {
            this.salt = await bcrypt.genSalt();
            this.password = await bcrypt.hash(this.password, this.salt);
        } catch (error) {
            Logger.log(LOG, "UserEnitity hashPasswordErr", error);
        }
    }
 
    //This is better way
    // async checkPassword(plainPassword: string): Promise<boolean> {
    //     Logger.log("SkillTest UserEnitity checkPassword", plainPassword);
    //     return await bcrypt.compare(plainPassword, this.password);
    // }

    async validatePassword(password: string): Promise<boolean> {
        const hash = await bcrypt.hash(password, this.salt);
        return hash === this.password;
    }
}
