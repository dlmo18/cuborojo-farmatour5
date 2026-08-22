import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Mission } from './mission.entity';

@Entity('mission_items')
export class MissionItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'mission_id' })
  missionId: string;

  @ManyToOne(() => Mission)
  @JoinColumn({ name: 'mission_id' })
  mission: Mission;

  @Column()
  title: string;

  @Column({ name: 'image_id', nullable: true })
  imageId: string;

  @Column({ name: 'thumbnail_id', nullable: true })
  thumbnailId: string;

  @Column({ nullable: true, type: 'text' })
  benefits: string;

  @Column({ name: 'content_badges', type: 'jsonb', default: [] })
  contentBadges: { title: string }[];

  @Column({ nullable: true, type: 'text' })
  detail: string;

  @Column({ name: 'order_num' })
  orderNum: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
