import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

@Entity('faq_items')
@Index('idx_faq_items_order', ['orderNum'], { unique: true })
export class FaqItem {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar', length: 255 }) title: string;
  @Column({ type: 'text' }) detail: string;
  @Column({ name: 'order_num' }) orderNum: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
