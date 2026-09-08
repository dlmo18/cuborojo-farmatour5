import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Level } from './level.entity';

@Entity('golden_level_items')
export class GoldenLevelItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'level_id' })
  levelId: string;

  @ManyToOne(() => Level)
  @JoinColumn({ name: 'level_id' })
  level: Level;

  @Column()
  title: string;

  @Column({ nullable: true, type: 'text' })
  detail: string;

  @Column({ name: 'order_num' })
  orderNum: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
