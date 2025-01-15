import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToOne,
    JoinColumn,
  } from 'typeorm';
  
  import { User } from './user.entity';
  
  @Entity()
  export class Profile {
    @PrimaryGeneratedColumn('increment')
    id: number;
  
    @Column()
    phone: string;
  
    @Column('date')
    birthday: Date;
  
    @Column()
    website: string;
  
    @Column()
    designation: string;
  
    @OneToOne(type => User)
    @JoinColumn()
    user: User;
  }