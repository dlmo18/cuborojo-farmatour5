import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ActivityLog } from './activity-log.entity';
import { QuestionsService } from '../questions/questions.service';

// Entidades inline de progreso
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, Unique } from 'typeorm';

@Entity('participant_mission_progress')
@Unique(['participantId', 'missionId'])
export class MissionProgress {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'participant_id' }) participantId: string;
  @Column({ name: 'mission_id' }) missionId: string;
  @Column({ name: 'stars_earned', default: 0 }) starsEarned: number;
  @Column({ name: 'is_completed', default: false }) isCompleted: boolean;
  @CreateDateColumn({ name: 'started_at' }) startedAt: Date;
  @Column({ name: 'completed_at', nullable: true }) completedAt: Date;
}

@Entity('participant_level_progress')
@Unique(['participantId', 'levelId'])
export class LevelProgress {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'participant_id' }) participantId: string;
  @Column({ name: 'level_id' }) levelId: string;
  @Column({ name: 'stars_earned', default: 0 }) starsEarned: number;
  @Column({ name: 'is_completed', default: false }) isCompleted: boolean;
  @CreateDateColumn({ name: 'started_at' }) startedAt: Date;
  @Column({ name: 'completed_at', nullable: true }) completedAt: Date;
}

@Entity('participant_world_progress')
@Unique(['participantId', 'worldId'])
export class WorldProgress {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'participant_id' }) participantId: string;
  @Column({ name: 'world_id' }) worldId: string;
  @Column({ name: 'stars_earned', default: 0 }) starsEarned: number;
  @Column({ name: 'is_completed', default: false }) isCompleted: boolean;
  @CreateDateColumn({ name: 'started_at' }) startedAt: Date;
  @Column({ name: 'completed_at', nullable: true }) completedAt: Date;
}

@Entity('participant_answers')
@Unique(['participantId', 'questionId'])
export class ParticipantAnswer {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'participant_id' }) participantId: string;
  @Column({ name: 'question_id' }) questionId: string;
  @Column({ name: 'answer_id', nullable: true }) answerId: string;
  @Column({ name: 'is_correct', default: false }) isCorrect: boolean;
  @Column({ name: 'stars_earned', default: 0 }) starsEarned: number;
  @CreateDateColumn({ name: 'answered_at' }) answeredAt: Date;
}

@Entity('participant_world_exam_answers')
@Unique(['participantId', 'examQuestionId'])
export class WorldExamAnswer {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'participant_id' }) participantId: string;
  @Column({ name: 'exam_question_id' }) examQuestionId: string;
  @Column({ name: 'answer_id', nullable: true }) answerId: string;
  @Column({ name: 'is_correct', default: false }) isCorrect: boolean;
  @Column({ name: 'stars_earned', default: 0 }) starsEarned: number;
  @CreateDateColumn({ name: 'answered_at' }) answeredAt: Date;
}

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(MissionProgress) private missionProgressRepo: Repository<MissionProgress>,
    @InjectRepository(LevelProgress) private levelProgressRepo: Repository<LevelProgress>,
    @InjectRepository(WorldProgress) private worldProgressRepo: Repository<WorldProgress>,
    @InjectRepository(ParticipantAnswer) private answerRepo: Repository<ParticipantAnswer>,
    @InjectRepository(ActivityLog) private logRepo: Repository<ActivityLog>,
    private questionsService: QuestionsService,
    private dataSource: DataSource,
  ) {}

  /** Obtener estado completo del juego para un participante */
  async getGameState(participantId: string) {
    const missionProgress = await this.missionProgressRepo.find({ where: { participantId } });
    const levelProgress = await this.levelProgressRepo.find({ where: { participantId } });
    const worldProgress = await this.worldProgressRepo.find({ where: { participantId } });
    return { missionProgress, levelProgress, worldProgress };
  }

  /** Progreso de mundos del participante */
  async getWorldsProgress(participantId: string) {
    return this.worldProgressRepo.find({ where: { participantId } });
  }

  /** Responder pregunta de misión */
  async answerQuestion(participantId: string, questionId: string, answerId: string) {
    // Verificar si ya respondió
    const existing = await this.answerRepo.findOne({ where: { participantId, questionId } });
    if (existing && existing.isCorrect) {
      throw new BadRequestException('Esta pregunta ya fue respondida correctamente');
    }

    const result = await this.questionsService.checkAnswer(questionId, answerId);

    const answer = this.answerRepo.create({
      participantId, questionId, answerId,
      isCorrect: result.isCorrect,
      starsEarned: result.stars,
    });
    await this.answerRepo.save(answer);

    // Actualizar progreso de misión
    await this.updateMissionProgress(participantId, questionId);

    return result;
  }

  private async updateMissionProgress(participantId: string, questionId: string) {
    // Obtener missionId desde la pregunta
    const res = await this.dataSource.query(
      `SELECT mission_id FROM questions WHERE id = $1`, [questionId]
    );
    if (!res[0]) return;
    const missionId = res[0].mission_id;

    // Contar preguntas totales vs respondidas correctamente
    const [totalQ] = await this.dataSource.query(
      `SELECT COUNT(*) as cnt FROM questions WHERE mission_id = $1 AND is_active = TRUE`, [missionId]
    );
    const [correctQ] = await this.dataSource.query(
      `SELECT COUNT(*) as cnt, COALESCE(SUM(pa.stars_earned),0) as stars
       FROM participant_answers pa
       JOIN questions q ON q.id = pa.question_id
       WHERE pa.participant_id = $1 AND q.mission_id = $2 AND pa.is_correct = TRUE`,
      [participantId, missionId]
    );

    const isCompleted = parseInt(correctQ.cnt) === parseInt(totalQ.cnt);
    const starsEarned = parseInt(correctQ.stars);

    await this.dataSource.query(`
      INSERT INTO participant_mission_progress (participant_id, mission_id, stars_earned, is_completed, completed_at)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (participant_id, mission_id) DO UPDATE
      SET stars_earned = $3, is_completed = $4, completed_at = $5
    `, [participantId, missionId, starsEarned, isCompleted, isCompleted ? new Date() : null]);

    if (isCompleted) {
      await this.logRepo.save(this.logRepo.create({
        participantId, action: 'mission_complete', entityType: 'mission', entityId: missionId,
        metadata: { starsEarned }
      }));
      await this.checkLevelCompletion(participantId, missionId);
    }
  }

  private async checkLevelCompletion(participantId: string, missionId: string) {
    const [lvl] = await this.dataSource.query(
      `SELECT level_id FROM missions WHERE id = $1`, [missionId]
    );
    if (!lvl) return;
    const levelId = lvl.level_id;

    const [totalM] = await this.dataSource.query(
      `SELECT COUNT(*) as cnt FROM missions WHERE level_id = $1 AND is_active = TRUE`, [levelId]
    );
    const [completedM] = await this.dataSource.query(
      `SELECT COUNT(*) as cnt, COALESCE(SUM(stars_earned),0) as stars
       FROM participant_mission_progress
       WHERE participant_id = $1 AND mission_id IN (SELECT id FROM missions WHERE level_id = $2) AND is_completed = TRUE`,
      [participantId, levelId]
    );

    const isCompleted = parseInt(completedM.cnt) === parseInt(totalM.cnt);
    if (isCompleted) {
      await this.dataSource.query(`
        INSERT INTO participant_level_progress (participant_id, level_id, stars_earned, is_completed, completed_at)
        VALUES ($1, $2, $3, TRUE, NOW())
        ON CONFLICT (participant_id, level_id) DO UPDATE
        SET stars_earned = $3, is_completed = TRUE, completed_at = NOW()
      `, [participantId, levelId, parseInt(completedM.stars)]);

      await this.logRepo.save(this.logRepo.create({
        participantId, action: 'level_complete', entityType: 'level', entityId: levelId
      }));
    }
  }

  /** Obtener ranking del grupo del participante */
  async getGroupRanking(participantId: string) {
    const rows = await this.dataSource.query(`
      SELECT p.id, p.full_name, p.total_stars,
             RANK() OVER (ORDER BY p.total_stars DESC) as rank
      FROM participants p
      WHERE p.group_id = (SELECT group_id FROM participants WHERE id = $1)
        AND p.is_active = TRUE
      ORDER BY p.total_stars DESC
      LIMIT 10
    `, [participantId]);

    const self = await this.dataSource.query(`
      SELECT id, full_name, total_stars,
             fn_group_rank(id::uuid) as rank
      FROM participants WHERE id = $1
    `, [participantId]);

    return { top10: rows, self: self[0] };
  }
}
