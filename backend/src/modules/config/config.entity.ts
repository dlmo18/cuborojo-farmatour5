import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('system_config')
export class SystemConfig {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) key: string;
  @Column({ nullable: true, type: 'text' }) value: string;
  @Column({ nullable: true }) description: string;
  @Column({ name: 'updated_by', nullable: true }) updatedBy: string;
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date;
}
