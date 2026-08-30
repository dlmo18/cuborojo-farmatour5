import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { GoldenLevelQuestion } from './golden-level-question.entity';

@Entity('golden_level_answer_options')
export class GoldenLevelAnswerOption {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'question_id' })
  questionId: string;

  @ManyToOne(() => GoldenLevelQuestion)
  @JoinColumn({ name: 'question_id' })
  question: GoldenLevelQuestion;

  @Column({ type: 'text' })
  text: string;

  @Column({ name: 'is_correct', default: false })
  isCorrect: boolean;

  @Column({ name: 'order_num' })
  orderNum: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
