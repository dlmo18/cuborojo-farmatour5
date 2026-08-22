import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

// Entities (inline for brevity - in production separate files)
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Mission } from '../missions/mission.entity';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'mission_id' }) missionId: string;
  @ManyToOne(() => Mission) @JoinColumn({ name: 'mission_id' }) mission: Mission;
  @Column({ type: 'text' }) content: string;
  @Column({ name: 'image_id', nullable: true }) imageId: string;
  @Column({ name: 'order_num' }) orderNum: number;
  @Column({ name: 'stars_value', default: 1 }) starsValue: number;
  @Column({ name: 'is_active', default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('answer_options')
export class AnswerOption {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'question_id' }) questionId: string;
  @ManyToOne(() => Question) @JoinColumn({ name: 'question_id' }) question: Question;
  @Column({ type: 'text' }) text: string;
  @Column({ name: 'image_id', nullable: true }) imageId: string;
  @Column({ name: 'is_correct', default: false }) isCorrect: boolean;
  @Column({ nullable: true, type: 'text' }) detail: string;
  @Column({ name: 'order_num' }) orderNum: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

export class CreateQuestionDto {
  @ApiProperty() @IsString() @IsNotEmpty() missionId: string;
  @ApiProperty() @IsString() @IsNotEmpty() content: string;
  @ApiProperty({ required: false }) @IsOptional() imageId?: string;
  @ApiProperty() @IsNumber() orderNum: number;
  @ApiProperty({ default: 1 }) @IsNumber() starsValue: number;
}

export class CreateAnswerOptionDto {
  @ApiProperty() @IsString() @IsNotEmpty() text: string;
  @ApiProperty({ required: false }) @IsOptional() imageId?: string;
  @ApiProperty() @IsBoolean() isCorrect: boolean;
  @ApiProperty({ required: false }) @IsOptional() detail?: string;
  @ApiProperty() @IsNumber() orderNum: number;
}

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question) private qRepo: Repository<Question>,
    @InjectRepository(AnswerOption) private aRepo: Repository<AnswerOption>,
  ) {}

  async findByMission(missionId: string, forParticipant = false) {
    const questions = await this.qRepo.find({
      where: { missionId, isActive: true },
      order: { orderNum: 'ASC' },
    });

    const result = [];
    for (const q of questions) {
      const options = await this.aRepo.find({
        where: { questionId: q.id },
        order: { orderNum: 'ASC' },
      });
      // Para participantes, no revelar la respuesta correcta
      result.push({
        ...q,
        options: forParticipant
          ? options.map(({ isCorrect, detail, ...o }) => o)
          : options,
      });
    }
    return result;
  }

  async findOne(id: string) {
    const q = await this.qRepo.findOne({ where: { id } });
    if (!q) throw new NotFoundException('Pregunta no encontrada');
    const options = await this.aRepo.find({ where: { questionId: id }, order: { orderNum: 'ASC' } });
    return { ...q, options };
  }

  async create(dto: CreateQuestionDto) {
    return this.qRepo.save(this.qRepo.create(dto));
  }

  async update(id: string, dto: Partial<CreateQuestionDto>) {
    await this.qRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.qRepo.update(id, { isActive: false });
    return { message: 'Pregunta desactivada' };
  }

  async addOption(questionId: string, dto: CreateAnswerOptionDto) {
    return this.aRepo.save(this.aRepo.create({ questionId, ...dto }));
  }

  async updateOption(optionId: string, dto: Partial<CreateAnswerOptionDto>) {
    await this.aRepo.update(optionId, dto);
    return this.aRepo.findOne({ where: { id: optionId } });
  }

  async removeOption(optionId: string) {
    await this.aRepo.delete(optionId);
    return { message: 'Opción eliminada' };
  }

  async checkAnswer(questionId: string, answerId: string): Promise<{ isCorrect: boolean; stars: number; detail: string }> {
    const option = await this.aRepo.findOne({ where: { id: answerId, questionId } });
    if (!option) throw new NotFoundException('Opción no encontrada');
    const question = await this.qRepo.findOne({ where: { id: questionId } });
    return {
      isCorrect: option.isCorrect,
      stars: option.isCorrect ? question.starsValue : 0,
      detail: option.isCorrect ? null : option.detail,
    };
  }
}
