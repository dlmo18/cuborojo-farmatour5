import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { World } from '../worlds/world.entity';

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

  @Column({ name: 'is_golden', default: false })
  isGolden: boolean;

  @Column({ name: 'max_stars', default: 0 })
  maxStars: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
