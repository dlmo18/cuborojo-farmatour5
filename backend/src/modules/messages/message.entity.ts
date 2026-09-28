import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity('messages')
@Index('idx_messages_created', ['createdAt'])
@Index('idx_messages_email', ['email'])
export class Message {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar', length: 255, name: 'full_name' }) fullName: string;
  @Column({ type: 'varchar', length: 255 }) email: string;
  @Column({ type: 'varchar', length: 255 }) subject: string;
  @Column({ type: 'text' }) message: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
