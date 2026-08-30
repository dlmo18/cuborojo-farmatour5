import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Level } from './level.entity';

@Entity('final_level_questions')
export class FinalLevelQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'level_id' })
  levelId: string;

  @ManyToOne(() => Level)
  @JoinColumn({ name: 'level_id' })
  level: Level;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'start_video_url', nullable: true })
  startVideoUrl: string;

  @Column({ name: 'start_video_id', nullable: true })
  startVideoId: string;

  @Column({ name: 'end_video_url', nullable: true })
  endVideoUrl: string;

  @Column({ name: 'end_video_id', nullable: true })
  endVideoId: string;

  @Column({ nullable: true, type: 'text' })
  correctMessage: string;

  @Column({ nullable: true, type: 'text' })
  incorrectMessage: string;

  @Column({ name: 'order_num' })
  orderNum: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
