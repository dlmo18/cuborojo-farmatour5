import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { FinalLevelQuestion } from './final-level-question.entity';

@Entity('final_level_answer_options')
export class FinalLevelAnswerOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'question_id' })
  questionId: string;

  @ManyToOne(() => FinalLevelQuestion)
  @JoinColumn({ name: 'question_id' })
  question: FinalLevelQuestion;

  @Column({ type: 'text' })
  text: string;

  @Column({ name: 'image_id', nullable: true })
  imageId: string;

  @Column({ name: 'is_correct', default: false })
  isCorrect: boolean;

  @Column({ name: 'order_num' })
  orderNum: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
