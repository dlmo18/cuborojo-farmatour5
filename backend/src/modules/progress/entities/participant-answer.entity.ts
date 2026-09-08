import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Unique } from 'typeorm';

@Entity('participant_answers')
@Unique(['participantId', 'questionId'])
export class ParticipantAnswer {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'participant_id' }) participantId: string;
  @Column({ name: 'question_id' }) questionId: string;
  @Column({ name: 'answer_id', nullable: true }) answerId: string;
  @Column({ name: 'is_correct', default: false }) isCorrect: boolean;
  @Column({ name: 'stars_earned', default: 0 }) starsEarned: number;
  @CreateDateColumn({ name: 'answered_at' }) answeredAt: Date;
}
