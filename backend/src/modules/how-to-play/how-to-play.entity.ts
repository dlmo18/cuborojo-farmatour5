import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('how_to_play')
export class HowToPlay {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'text' }) content: string;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
