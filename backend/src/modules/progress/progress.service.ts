import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ActivityLog } from './activity-log.entity';
import { MissionProgress } from './entities/mission-progress.entity';
import { LevelProgress } from './entities/level-progress.entity';
import { WorldProgress } from './entities/world-progress.entity';
import { ParticipantAnswer } from './entities/participant-answer.entity';
import { WorldExamAnswer } from './entities/world-exam-answer.entity';
import { QuestionsService } from '../questions/questions.service';

// Re-export entities for module registration
export { MissionProgress, LevelProgress, WorldProgress, ParticipantAnswer, WorldExamAnswer };

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

    // Contar preguntas totales
    const [totalQ] = await this.dataSource.query(
      `SELECT COUNT(*) as cnt FROM questions WHERE mission_id = $1 AND is_active = TRUE`, [missionId]
    );
    
    // Contar preguntas RESPONDIDAS (sin importar si fueron correctas)
    const [answeredQ] = await this.dataSource.query(
      `SELECT COUNT(DISTINCT pa.question_id) as cnt FROM participant_answers pa
       WHERE pa.participant_id = $1 AND pa.question_id IN (
         SELECT id FROM questions WHERE mission_id = $2 AND is_active = TRUE
       )`,
      [participantId, missionId]
    );

    // Sumar estrellas SOLO de respuestas correctas
    const [correctQ] = await this.dataSource.query(
      `SELECT COALESCE(SUM(pa.stars_earned),0) as stars
       FROM participant_answers pa
       JOIN questions q ON q.id = pa.question_id
       WHERE pa.participant_id = $1 AND q.mission_id = $2 AND pa.is_correct = TRUE`,
      [participantId, missionId]
    );

    // Misión completada cuando TODAS las preguntas fueron respondidas (correct or not)
    const isCompleted = parseInt(answeredQ.cnt) === parseInt(totalQ.cnt);
    const starsEarned = parseInt(correctQ.stars);

    console.log(`[Mission Progress] Participant: ${participantId}, Mission: ${missionId}, Stars: ${starsEarned}, Completed: ${isCompleted} (${answeredQ.cnt}/${totalQ.cnt})`);

    await this.dataSource.query(`
      INSERT INTO participant_mission_progress (participant_id, mission_id, stars_earned, is_completed, completed_at)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (participant_id, mission_id) DO UPDATE
      SET stars_earned = $3, is_completed = $4, completed_at = CASE WHEN $4 = TRUE THEN NOW() ELSE participant_mission_progress.completed_at END
    `, [participantId, missionId, starsEarned, isCompleted, isCompleted ? new Date() : null]);

    if (isCompleted) {
      await this.logRepo.save(this.logRepo.create({
        participantId, action: 'mission_complete', entityType: 'mission', entityId: missionId,
        metadata: { starsEarned, totalQuestions: totalQ.cnt, answeredQuestions: answeredQ.cnt }
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

    // Contar misiones totales del nivel
    const [totalM] = await this.dataSource.query(
      `SELECT COUNT(*) as cnt FROM missions WHERE level_id = $1 AND is_active = TRUE`, [levelId]
    );
    
    // Contar misiones completadas del nivel y sumar estrellas de TODAS las misiones
    const [missionStats] = await this.dataSource.query(
      `SELECT 
        COUNT(*) as completed_cnt,
        COALESCE(SUM(stars_earned), 0) as stars
       FROM participant_mission_progress
       WHERE participant_id = $1 
         AND mission_id IN (SELECT id FROM missions WHERE level_id = $2 AND is_active = TRUE)
         AND is_completed = TRUE`,
      [participantId, levelId]
    );

    const totalMissions = parseInt(totalM.cnt);
    const completedMissions = parseInt(missionStats.completed_cnt);
    const starsEarned = parseInt(missionStats.stars);
    const isCompleted = completedMissions === totalMissions;

    console.log(`[Level Progress] Participant: ${participantId}, Level: ${levelId}, Stars: ${starsEarned}, Completed: ${isCompleted} (${completedMissions}/${totalMissions})`);

    if (isCompleted) {
      await this.dataSource.query(`
        INSERT INTO participant_level_progress (participant_id, level_id, stars_earned, is_completed, completed_at)
        VALUES ($1, $2, $3, TRUE, NOW())
        ON CONFLICT (participant_id, level_id) DO UPDATE
        SET stars_earned = $3, is_completed = TRUE, completed_at = NOW()
      `, [participantId, levelId, starsEarned]);

      await this.logRepo.save(this.logRepo.create({
        participantId, action: 'level_complete', entityType: 'level', entityId: levelId,
        metadata: { starsEarned }
      }));

      // Validar si el mundo está completo
      await this.checkWorldCompletion(participantId, levelId);
    }
  }

  private async checkWorldCompletion(participantId: string, levelId: string) {
    // Obtener worldId desde el nivel
    const [wrld] = await this.dataSource.query(
      `SELECT world_id FROM levels WHERE id = $1`, [levelId]
    );
    if (!wrld) return;
    const worldId = wrld.world_id;

    // Contar niveles totales del mundo (solo NORMAL y GOLDEN, no FINAL)
    const [totalL] = await this.dataSource.query(
      `SELECT COUNT(*) as cnt FROM levels 
       WHERE world_id = $1 AND is_active = TRUE AND level_type IN ('normal', 'golden')`, 
      [worldId]
    );
    
    // Contar niveles completados del mundo y sumar estrellas de TODOS los niveles
    const [levelStats] = await this.dataSource.query(
      `SELECT 
        COUNT(*) as completed_cnt,
        COALESCE(SUM(stars_earned), 0) as stars
       FROM participant_level_progress
       WHERE participant_id = $1 
         AND level_id IN (SELECT id FROM levels WHERE world_id = $2 AND is_active = TRUE AND level_type IN ('normal', 'golden'))
         AND is_completed = TRUE`,
      [participantId, worldId]
    );

    const totalLevels = parseInt(totalL.cnt);
    const completedLevels = parseInt(levelStats.completed_cnt);
    const starsEarned = parseInt(levelStats.stars);
    const isCompleted = completedLevels === totalLevels && totalLevels > 0;

    console.log(`[World Progress] Participant: ${participantId}, World: ${worldId}, Stars: ${starsEarned}, Completed: ${isCompleted} (${completedLevels}/${totalLevels})`);

    if (isCompleted) {
      await this.dataSource.query(`
        INSERT INTO participant_world_progress (participant_id, world_id, stars_earned, is_completed, completed_at)
        VALUES ($1, $2, $3, TRUE, NOW())
        ON CONFLICT (participant_id, world_id) DO UPDATE
        SET stars_earned = $3, is_completed = TRUE, completed_at = NOW()
      `, [participantId, worldId, starsEarned]);

      await this.logRepo.save(this.logRepo.create({
        participantId, action: 'world_complete', entityType: 'world', entityId: worldId,
        metadata: { starsEarned }
      }));
    }
  }

  /** Verificar y marcar golden level como completado */
  async checkGoldenLevelCompletion(participantId: string, questionId: string) {
    // Obtener el levelId desde la pregunta de golden level
    const [glq] = await this.dataSource.query(
      `SELECT level_id FROM golden_level_questions WHERE id = $1`, [questionId]
    );
    if (!glq) return;
    const levelId = glq.level_id;

    // Contar preguntas totales del golden level vs respondidas correctamente
    const [totalQ] = await this.dataSource.query(
      `SELECT COUNT(*) as cnt FROM golden_level_questions WHERE level_id = $1 AND is_active = TRUE`, [levelId]
    );
    const [correctQ] = await this.dataSource.query(
      `SELECT COUNT(*) as cnt, COALESCE(SUM(pa.stars_earned),0) as stars
       FROM participant_golden_level_answers pa
       JOIN golden_level_questions glq ON glq.id = pa.question_id
       WHERE pa.participant_id = $1 AND glq.level_id = $2 AND pa.is_correct = TRUE`,
      [participantId, levelId]
    );

    const isCompleted = parseInt(correctQ.cnt) === parseInt(totalQ.cnt);
    const starsEarned = parseInt(correctQ.stars);

    console.log(`[Golden Level Progress] Participant: ${participantId}, Level: ${levelId}, Stars: ${starsEarned}, Completed: ${isCompleted} (${correctQ.cnt}/${totalQ.cnt})`);

    if (isCompleted) {
      await this.dataSource.query(`
        INSERT INTO participant_level_progress (participant_id, level_id, stars_earned, is_completed, completed_at)
        VALUES ($1, $2, $3, TRUE, NOW())
        ON CONFLICT (participant_id, level_id) DO UPDATE
        SET stars_earned = $3, is_completed = TRUE, completed_at = NOW()
      `, [participantId, levelId, starsEarned]);

      await this.logRepo.save(this.logRepo.create({
        participantId, action: 'golden_level_complete', entityType: 'level', entityId: levelId,
        metadata: { starsEarned }
      }));

      // Validar si el mundo está completo
      await this.checkWorldCompletion(participantId, levelId);
    }
  }

  /** Verificar y marcar final level como completado */
  async checkFinalLevelCompletion(participantId: string, questionId: string) {
    // Obtener el levelId desde la pregunta de final level
    const [flq] = await this.dataSource.query(
      `SELECT level_id FROM final_level_questions WHERE id = $1`, [questionId]
    );
    if (!flq) return;
    const levelId = flq.level_id;

    // Contar preguntas totales del final level vs respondidas correctamente
    const [totalQ] = await this.dataSource.query(
      `SELECT COUNT(*) as cnt FROM final_level_questions WHERE level_id = $1 AND is_active = TRUE`, [levelId]
    );
    const [correctQ] = await this.dataSource.query(
      `SELECT COUNT(*) as cnt, COALESCE(SUM(pa.stars_earned),0) as stars
       FROM participant_final_level_answers pa
       JOIN final_level_questions flq ON flq.id = pa.question_id
       WHERE pa.participant_id = $1 AND flq.level_id = $2 AND pa.is_correct = TRUE`,
      [participantId, levelId]
    );

    const isCompleted = parseInt(correctQ.cnt) === parseInt(totalQ.cnt);
    const starsEarned = parseInt(correctQ.stars);

    console.log(`[Final Level Progress] Participant: ${participantId}, Level: ${levelId}, Stars: ${starsEarned}, Completed: ${isCompleted} (${correctQ.cnt}/${totalQ.cnt})`);

    if (isCompleted) {
      await this.dataSource.query(`
        INSERT INTO participant_level_progress (participant_id, level_id, stars_earned, is_completed, completed_at)
        VALUES ($1, $2, $3, TRUE, NOW())
        ON CONFLICT (participant_id, level_id) DO UPDATE
        SET stars_earned = $3, is_completed = TRUE, completed_at = NOW()
      `, [participantId, levelId, starsEarned]);

      await this.logRepo.save(this.logRepo.create({
        participantId, action: 'final_level_complete', entityType: 'level', entityId: levelId,
        metadata: { starsEarned }
      }));

      // Validar si el mundo está completo
      await this.checkWorldCompletion(participantId, levelId);
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

  /** Responder pregunta de nivel dorado */
  async answerGoldenLevelQuestion(participantId: string, questionId: string, answerId: string) {
    // Verificar si ya respondió correctamente
    const existing = await this.dataSource.query(
      `SELECT is_correct FROM participant_golden_level_answers WHERE participant_id = $1 AND question_id = $2`,
      [participantId, questionId]
    );
    if (existing.length > 0 && existing[0].is_correct) {
      throw new BadRequestException('Esta pregunta ya fue respondida correctamente');
    }

    // Verificar si la respuesta es correcta
    const [answerOption] = await this.dataSource.query(
      `SELECT is_correct FROM golden_level_answer_options WHERE id = $1 AND question_id = $2`,
      [answerId, questionId]
    );
    if (!answerOption) {
      throw new BadRequestException('Opción de respuesta no válida');
    }

    const isCorrect = answerOption.is_correct;
    const starsEarned = isCorrect ? 1 : 0;

    // Guardar respuesta
    await this.dataSource.query(`
      INSERT INTO participant_golden_level_answers (participant_id, question_id, answer_id, is_correct, stars_earned)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (participant_id, question_id) DO UPDATE
      SET answer_id = $3, is_correct = $4, stars_earned = $5
    `, [participantId, questionId, answerId, isCorrect, starsEarned]);

    // Verificar si el nivel está completado
    if (isCorrect) {
      await this.checkGoldenLevelCompletion(participantId, questionId);
    }

    return { isCorrect, starsEarned };
  }

  /** Responder pregunta de nivel final */
  async answerFinalLevelQuestion(participantId: string, questionId: string, answerId: string) {
    // Verificar si ya respondió correctamente
    const existing = await this.dataSource.query(
      `SELECT is_correct FROM participant_final_level_answers WHERE participant_id = $1 AND question_id = $2`,
      [participantId, questionId]
    );
    if (existing.length > 0 && existing[0].is_correct) {
      throw new BadRequestException('Esta pregunta ya fue respondida correctamente');
    }

    // Verificar si la respuesta es correcta
    const [answerOption] = await this.dataSource.query(
      `SELECT is_correct FROM final_level_answer_options WHERE id = $1 AND question_id = $2`,
      [answerId, questionId]
    );
    if (!answerOption) {
      throw new BadRequestException('Opción de respuesta no válida');
    }

    const isCorrect = answerOption.is_correct;
    const starsEarned = isCorrect ? 1 : 0;

    // Guardar respuesta
    await this.dataSource.query(`
      INSERT INTO participant_final_level_answers (participant_id, question_id, answer_id, is_correct, stars_earned)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (participant_id, question_id) DO UPDATE
      SET answer_id = $3, is_correct = $4, stars_earned = $5
    `, [participantId, questionId, answerId, isCorrect, starsEarned]);

    // Verificar si el nivel está completado
    if (isCorrect) {
      await this.checkFinalLevelCompletion(participantId, questionId);
    }

    return { isCorrect, starsEarned };
  }

  /** Obtener respuestas del participante para una misión específica */
  async getMissionAnswers(participantId: string, missionId: string) {
    const answers = await this.dataSource.query(`
      SELECT 
        pa.question_id as "questionId",
        pa.answer_id as "answerId",
        pa.is_correct as "isCorrect",
        pa.stars_earned as "starsEarned"
      FROM participant_answers pa
      JOIN questions q ON q.id = pa.question_id
      WHERE pa.participant_id = $1 AND q.mission_id = $2
      ORDER BY q.order_num ASC
    `, [participantId, missionId]);

    return answers;
  }

  /** Completar una misión manualmente */
  async completeMission(participantId: string, missionId: string) {
    // Obtener el progreso de la misión
    const [progress] = await this.dataSource.query(`
      SELECT stars_earned, is_completed FROM participant_mission_progress
      WHERE participant_id = $1 AND mission_id = $2
    `, [participantId, missionId]);

    if (!progress) {
      throw new Error('Misión no iniciada');
    }

    // Marcar como completada
    await this.dataSource.query(`
      UPDATE participant_mission_progress
      SET is_completed = TRUE, completed_at = NOW()
      WHERE participant_id = $1 AND mission_id = $2
    `, [participantId, missionId]);

    // Registrar en log de actividad
    await this.logRepo.save(this.logRepo.create({
      participantId,
      action: 'mission_complete',
      entityType: 'mission',
      entityId: missionId,
      metadata: { starsEarned: progress.stars_earned }
    }));

    // Verificar si el nivel está completado
    await this.checkLevelCompletion(participantId, missionId);

    return { success: true, message: 'Misión completada' };
  }

}
