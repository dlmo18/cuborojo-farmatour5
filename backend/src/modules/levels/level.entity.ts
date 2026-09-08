import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { World } from '../worlds/world.entity';

export enum LevelType {
  NORMAL = 'normal',
  GOLDEN = 'golden',
  FINAL = 'final'
}

@Entity('levels')
export class Level {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'world_id' })
  worldId: string;

  @ManyToOne(() => World)
  @JoinColumn({ name: 'world_id' })
  world: World;

  @Column()
  name: string;

  @Column({ nullable: true, type: 'text' })
  description: string;

  @Column({ name: 'image_id', nullable: true })
  imageId: string;

  @Column({ name: 'order_num' })
  orderNum: number;

  @Column({ name: 'level_type', type: 'enum', enum: LevelType, default: LevelType.NORMAL })
  levelType: LevelType;

  @Column({ name: 'is_golden', default: false })
  isGolden: boolean;

  @Column({ name: 'intro_video_url', nullable: true })
  introVideoUrl: string;

  @Column({ name: 'intro_video_id', nullable: true })
  introVideoId: string;

  @Column({ name: 'max_stars', default: 0 })
  maxStars: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
