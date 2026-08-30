import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Level } from './level.entity';

@Entity('level_items')
export class LevelItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'level_id' })
  levelId: string;

  @ManyToOne(() => Level, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'level_id' })
  level: Level;

  @Column({ type: 'text' })
  title: string;

  @Column({ type: 'text', nullable: true })
  detail: string;

  @Column({ name: 'image_id', nullable: true })
  imageId: string;

  @Column({ name: 'thumbnail_id', nullable: true })
  thumbnailId: string;

  @Column({ type: 'text', nullable: true })
  benefits: string;

  @Column({ name: 'order_num' })
  orderNum: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
