import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

@Entity('participant_world_progress')
@Unique(['participantId', 'worldId'])
export class WorldProgress {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'participant_id' }) participantId: string;
  @Column({ name: 'world_id' }) worldId: string;
  @Column({ name: 'stars_earned', default: 0 }) starsEarned: number;
  @Column({ name: 'is_completed', default: false }) isCompleted: boolean;
  @CreateDateColumn({ name: 'started_at' }) startedAt: Date;
  @Column({ name: 'completed_at', nullable: true }) completedAt: Date;
}
