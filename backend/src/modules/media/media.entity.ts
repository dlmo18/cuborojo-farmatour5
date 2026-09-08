import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';

@Entity('media_library')
export class MediaItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ['image', 'video', 'audio', 'document'] })
  type: string;

  @Column()
  url: string;

  @Column({ name: 'file_size', nullable: true, type: 'bigint' })
  fileSize: number;

  @Column({ name: 'mime_type', nullable: true })
  mimeType: string;

  @Column({ nullable: true })
  width: number;

  @Column({ nullable: true })
  height: number;

  @Column({ type: 'text', array: true, nullable: true })
  tags: string[];

  @Column({ name: 'uploaded_by', nullable: true })
  uploadedBy: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
