import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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
}
