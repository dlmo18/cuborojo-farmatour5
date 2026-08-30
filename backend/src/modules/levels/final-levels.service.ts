import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FinalLevelQuestion } from './final-level-question.entity';
import { FinalLevelAnswerOption } from './final-level-answer-option.entity';
import { CreateFinalLevelQuestionDto, UpdateFinalLevelQuestionDto, CreateFinalLevelAnswerOptionDto, UpdateFinalLevelAnswerOptionDto } from './levels.service';

@Injectable()
export class FinalLevelsService {
  constructor(
    @InjectRepository(FinalLevelQuestion) private questionsRepo: Repository<FinalLevelQuestion>,
    @InjectRepository(FinalLevelAnswerOption) private answersRepo: Repository<FinalLevelAnswerOption>,
  ) {}

  // ============================================================
  // PREGUNTAS
  // ============================================================

  async getQuestionsByLevel(levelId: string) {
    return this.questionsRepo.find({ where: { levelId, isActive: true }, order: { orderNum: 'ASC' } });
  }

  async getQuestionById(id: string) {
    const question = await this.questionsRepo.findOne({ where: { id } });
    if (!question) throw new NotFoundException('Pregunta no encontrada');
    return question;
  }

  async createQuestion(dto: CreateFinalLevelQuestionDto) {
    return this.questionsRepo.save(this.questionsRepo.create(dto));
  }

  async updateQuestion(id: string, dto: UpdateFinalLevelQuestionDto) {
    await this.getQuestionById(id);
    await this.questionsRepo.update(id, dto);
    return this.getQuestionById(id);
  }

  async deleteQuestion(id: string) {
    await this.getQuestionById(id);
    await this.questionsRepo.update(id, { isActive: false });
    return { message: 'Pregunta desactivada' };
  }

  // ============================================================
  // OPCIONES DE RESPUESTA
  // ============================================================

  async getAnswerOptionsByQuestion(questionId: string) {
    return this.answersRepo.find({ where: { questionId }, order: { orderNum: 'ASC' } });
  }

  async getAnswerOptionById(id: string) {
    const option = await this.answersRepo.findOne({ where: { id } });
    if (!option) throw new NotFoundException('Opción de respuesta no encontrada');
    return option;
  }

  async createAnswerOption(dto: CreateFinalLevelAnswerOptionDto) {
    // Validar que solo una opción sea la correcta
    const existingCorrect = await this.answersRepo.findOne({
      where: { questionId: dto.questionId, isCorrect: true },
    });

    if (dto.isCorrect && existingCorrect) {
      throw new Error('Ya existe una opción correcta para esta pregunta');
    }

    return this.answersRepo.save(this.answersRepo.create(dto));
  }

  async updateAnswerOption(id: string, dto: UpdateFinalLevelAnswerOptionDto) {
    const option = await this.getAnswerOptionById(id);

    if (dto.isCorrect && !option.isCorrect) {
      // Cambiar la opción a correcta, desactivar otras
      await this.answersRepo.update(
        { questionId: option.questionId, isCorrect: true },
        { isCorrect: false }
      );
    }

    await this.answersRepo.update(id, dto);
    return this.getAnswerOptionById(id);
  }

  async deleteAnswerOption(id: string) {
    await this.getAnswerOptionById(id);
    await this.answersRepo.delete(id);
    return { message: 'Opción eliminada' };
  }

  // ============================================================
  // UTILIDADES
  // ============================================================

  async getQuestionWithAnswers(questionId: string) {
    const question = await this.getQuestionById(questionId);
    const answers = await this.getAnswerOptionsByQuestion(questionId);
    return { ...question, answers };
  }

  async getLevelContent(levelId: string) {
    const questions = await this.getQuestionsByLevel(levelId);

    const questionsWithAnswers = await Promise.all(
      questions.map(async (q) => ({
        ...q,
        answers: await this.getAnswerOptionsByQuestion(q.id),
      }))
    );

    return { questions: questionsWithAnswers };
  }
}
