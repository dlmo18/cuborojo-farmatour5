import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

@Entity('participant_mission_progress')
@Unique(['participantId', 'missionId'])
export class MissionProgress {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'participant_id' }) participantId: string;
  @Column({ name: 'mission_id' }) missionId: string;
  @Column({ name: 'stars_earned', default: 0 }) starsEarned: number;
  @Column({ name: 'is_completed', default: false }) isCompleted: boolean;
  @CreateDateColumn({ name: 'started_at' }) startedAt: Date;
  @Column({ name: 'completed_at', nullable: true }) completedAt: Date;
}
