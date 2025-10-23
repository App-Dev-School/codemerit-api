import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';
import { IAppNotification } from '../interface/notification.interface';

@Entity()
export class AppNotification implements IAppNotification {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'int', nullable: false })
    userId: number;

    @Column({ type: 'int', nullable: true, default: 0 })
    senderId: number;

    @Column({ type: 'varchar', nullable: false, length: 100 })
    title: string;

    @Column({ type: 'varchar', nullable: false, length: 255 })
    message: string;

    @Column({ type: 'int', nullable: true, default: 0 })
    isSeen: number; // 0 = false, 1 = true

    @Column({ type: 'varchar', length: 100, nullable: true })
    dataId: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    dataTitle: string;

    @CreateDateColumn({ name: 'createdAt' })
    createdAt: Date;
}
