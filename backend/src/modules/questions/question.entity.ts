import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Mission } from '../missions/mission.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'mission_id' }) missionId: string;
  @ManyToOne(() => Mission) @JoinColumn({ name: 'mission_id' }) mission: Mission;
  @Column({ type: 'text' }) content: string;
  @Column({ name: 'image_id', nullable: true }) imageId: string;
  @Column({ name: 'order_num' }) orderNum: number;
  @Column({ name: 'stars_value', default: 1 }) starsValue: number;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('answer_options')
export class AnswerOption {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'question_id' }) questionId: string;
  @ManyToOne(() => Question) @JoinColumn({ name: 'question_id' }) question: Question;
  @Column({ type: 'text' }) text: string;
  @Column({ name: 'image_id', nullable: true }) imageId: string;
  @Column({ name: 'is_correct', default: false }) isCorrect: boolean;
  @Column({ nullable: true, type: 'text' }) detail: string;
  @Column({ name: 'order_num' }) orderNum: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}
