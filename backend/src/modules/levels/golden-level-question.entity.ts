import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Level } from './level.entity';

@Entity('golden_level_questions')
export class GoldenLevelQuestion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'level_id' })
  levelId: string;

  @ManyToOne(() => Level)
  @JoinColumn({ name: 'level_id' })
  level: Level;

  @Column({ type: 'text' })
  content: string;

  @Column({ name: 'order_num' })
  orderNum: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
