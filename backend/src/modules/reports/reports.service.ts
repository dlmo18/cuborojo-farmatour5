import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ActivityLog } from '../progress/activity-log.entity';
import { ProgressService } from '../progress/progress.service';
import { AdminGuard } from '../auth/guards';

@Injectable()
export class ReportsService {
  constructor(
    private dataSource: DataSource,
    private progressService: ProgressService,
  ) {}

  async getTop10Participants() {
    return this.dataSource.query(`
      SELECT id, full_name, dni, total_stars, group_name, global_rank
      FROM v_participant_ranking LIMIT 10
    `);
  }

  async getTop10Groups() {
    return this.dataSource.query(`
      SELECT group_id, group_name, participant_count, total_group_stars, group_rank
      FROM v_group_ranking LIMIT 10
    `);
  }

  async getParticipantSummary(page = 1, limit = 20, search?: string) {
    const offset = (page - 1) * limit;
    const where = search ? `WHERE full_name ILIKE '%${search}%' OR dni ILIKE '%${search}%'` : '';
    const data = await this.dataSource.query(`
      SELECT * FROM v_participant_summary ${where}
      ORDER BY total_stars DESC
      LIMIT $1 OFFSET $2
    `, [limit, offset]);
    const [{ count }] = await this.dataSource.query(`SELECT COUNT(*) FROM v_participant_summary ${where}`);
    return { data, total: parseInt(count), page, limit, pages: Math.ceil(parseInt(count) / limit) };
  }

  async getWorldCompletionStats() {
    return this.dataSource.query(`
      SELECT w.name as world_name, w.order_num,
        COUNT(DISTINCT pwp.participant_id) FILTER (WHERE pwp.is_completed) as completed_count,
        COUNT(DISTINCT p.id) as total_participants,
        ROUND(COUNT(DISTINCT pwp.participant_id) FILTER (WHERE pwp.is_completed) * 100.0 /
          NULLIF(COUNT(DISTINCT p.id), 0), 2) as completion_rate
      FROM worlds w
      CROSS JOIN participants p
      LEFT JOIN participant_world_progress pwp ON pwp.world_id = w.id AND pwp.participant_id = p.id
      WHERE w.is_active = TRUE AND p.is_active = TRUE
      GROUP BY w.id, w.name, w.order_num
      ORDER BY w.order_num
    `);
  }

  async getMissionCompletionStats() {
    return this.dataSource.query(`
      SELECT m.name as mission_name, l.name as level_name, w.name as world_name,
        COUNT(DISTINCT pmp.participant_id) FILTER (WHERE pmp.is_completed) as completed_count,
        ROUND(AVG(pmp.stars_earned), 2) as avg_stars
      FROM missions m
      JOIN levels l ON l.id = m.level_id
      JOIN worlds w ON w.id = l.world_id
      LEFT JOIN participant_mission_progress pmp ON pmp.mission_id = m.id
      WHERE m.is_active = TRUE
      GROUP BY m.id, m.name, l.name, w.name
      ORDER BY w.order_num, l.order_num, m.order_num
    `);
  }

  async getActivityByDay(days = 30) {
    return this.dataSource.query(`
      SELECT DATE(created_at) as date,
             COUNT(*) FILTER (WHERE action = 'login') as logins,
             COUNT(*) FILTER (WHERE action = 'mission_complete') as missions_completed,
             COUNT(*) FILTER (WHERE action = 'level_complete') as levels_completed
      FROM activity_logs
      WHERE created_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `);
  }

  async getGroupLeaderboard() {
    return this.dataSource.query(`
      SELECT * FROM v_group_ranking ORDER BY group_rank LIMIT 20
    `);
  }

  async getParticipantDetail(participantId: string) {
    const [participant] = await this.dataSource.query(`
      SELECT p.*, g.name as group_name,
        (SELECT COUNT(*) FROM participant_mission_progress WHERE participant_id = p.id AND is_completed) as missions_done,
        (SELECT COUNT(*) FROM participant_level_progress WHERE participant_id = p.id AND is_completed) as levels_done,
        (SELECT COUNT(*) FROM participant_world_progress WHERE participant_id = p.id AND is_completed) as worlds_done
      FROM participants p LEFT JOIN groups g ON g.id = p.group_id
      WHERE p.id = $1
    `, [participantId]);

    const logs = await this.dataSource.query(`
      SELECT action, entity_type, metadata, created_at
      FROM activity_logs WHERE participant_id = $1
      ORDER BY created_at DESC LIMIT 50
    `, [participantId]);

    return { participant, recentActivity: logs };
  }

  async getParticipantProgress(participantId: string) {
    // Obtener datos del participante
    const [participant] = await this.dataSource.query(`
      SELECT id, full_name, dni FROM participants WHERE id = $1
    `, [participantId]);

    if (!participant) {
      return null;
    }

    // Obtener todos los mundos con sus niveles y misiones
    const worldsData = await this.dataSource.query(`
      SELECT 
        w.id as world_id,
        w.name as world_name,
        w.order_num,
        l.id as level_id,
        l.name as level_name,
        l.level_type,
        l.max_stars,
        m.id as mission_id,
        m.name as mission_name,
        COALESCE(pmp.stars_earned, 0) as mission_stars_earned,
        COALESCE(pmp.is_completed, false) as mission_completed,
        COALESCE(plp.stars_earned, 0) as level_stars_earned,
        COALESCE(plp.is_completed, false) as level_completed
      FROM worlds w
      LEFT JOIN levels l ON l.world_id = w.id AND l.is_active = true
      LEFT JOIN missions m ON m.level_id = l.id AND m.is_active = true
      LEFT JOIN participant_mission_progress pmp ON pmp.mission_id = m.id AND pmp.participant_id = $1
      LEFT JOIN participant_level_progress plp ON plp.level_id = l.id AND plp.participant_id = $1
      WHERE w.is_active = true
      ORDER BY w.order_num, l.order_num, m.order_num
    `, [participantId]);

    // Obtener preguntas y respuestas del participante
    const questionsData = await this.dataSource.query(`
      SELECT 
        m.id as mission_id,
        q.id as question_id,
        q.content,
        (SELECT "text" FROM answer_options WHERE question_id = q.id AND is_correct = true LIMIT 1) as correct_answer,
        COALESCE(ao.text, NULL) as selected_answer,
        CASE 
          WHEN pa.id IS NULL THEN NULL
          ELSE ao.is_correct
        END as is_correct,
        q.created_at
      FROM missions m
      LEFT JOIN questions q ON q.mission_id = m.id
      LEFT JOIN participant_answers pa ON pa.question_id = q.id 
        AND pa.participant_id = $1
      LEFT JOIN answer_options ao ON ao.id = pa.answer_id
      WHERE q.id IS NOT NULL
      ORDER BY m.id, q.created_at
    `, [participantId]);

    // Obtener todas las opciones de respuesta para cada pregunta
    const allAnswerOptions = await this.dataSource.query(`
      SELECT DISTINCT 
        q.id as question_id,
        ao."text" as answer_text
      FROM questions q
      LEFT JOIN answer_options ao ON ao.question_id = q.id
      WHERE ao.id IS NOT NULL
      ORDER BY q.id, ao."text"
    `);

    // Agrupar preguntas por misión
    const questionsByMission = new Map<string, any[]>();
    const answerOptionsByQuestion = new Map<string, string[]>();

    // Agrupar opciones de respuesta por pregunta
    allAnswerOptions.forEach((row: any) => {
      const questionId = row.question_id;
      if (!answerOptionsByQuestion.has(questionId)) {
        answerOptionsByQuestion.set(questionId, []);
      }
      if (row.answer_text) {
        answerOptionsByQuestion.get(questionId)!.push(row.answer_text);
      }
    });

    questionsData.forEach((row: any) => {
      const missionId = row.mission_id;
      if (!questionsByMission.has(missionId)) {
        questionsByMission.set(missionId, []);
      }
      questionsByMission.get(missionId)!.push({
        questionId: row.question_id,
        questionText: row.content,
        selectedAnswer: row.selected_answer,
        correctAnswer: row.correct_answer,
        isCorrect: row.is_correct,
        answerOptions: answerOptionsByQuestion.get(row.question_id) || []
      });
    });

    // Calcular estadísticas totales por mundo, nivel y misión
    const totalStarsData = await this.dataSource.query(`
      SELECT COALESCE(SUM(pmp.stars_earned), 0) as total_stars
      FROM participant_mission_progress pmp
      WHERE pmp.participant_id = $1
    `, [participantId]);

    // Calcular máximo de estrellas posibles
    const maxStarsData = await this.dataSource.query(`
      SELECT COALESCE(SUM(COALESCE(l.max_stars, 0)), 0) as max_stars
      FROM levels l
      WHERE l.is_active = true
    `);

    // Agrupar datos por mundo y nivel
    const worldsMap = new Map();
    
    worldsData.forEach((row: any) => {
      const { world_id, world_name, order_num, level_id, level_name, level_type, max_stars, mission_id, mission_name, mission_stars_earned, mission_completed, level_stars_earned, level_completed } = row;
      
      if (!worldsMap.has(world_id)) {
        worldsMap.set(world_id, {
          worldId: world_id,
          worldName: world_name,
          orderNum: order_num,
          totalStars: 0,
          maxStars: 0,
          completedLevels: 0,
          totalLevels: 0,
          levels: new Map()
        });
      }
      
      const world = worldsMap.get(world_id);
      
      if (level_id && !world.levels.has(level_id)) {
        world.levels.set(level_id, {
          levelId: level_id,
          levelName: level_name,
          levelType: level_type || 'normal',
          starsEarned: level_stars_earned || 0,
          maxStars: max_stars || 0,
          isCompleted: level_completed || false,
          missions: []
        });
        world.totalLevels += 1;
        world.maxStars += (max_stars || 0);
        if (level_completed) world.completedLevels += 1;
      }
      
      if (level_id && mission_id) {
        const level = world.levels.get(level_id);
        level.missions.push({
          missionId: mission_id,
          missionName: mission_name,
          starsEarned: mission_stars_earned || 0,
          maxStars: level_type === 'golden' ? 5 : level_type === 'final' ? 10 : 3,
          isCompleted: mission_completed || false,
          questions: questionsByMission.get(mission_id) || []
        });
        world.totalStars += (mission_stars_earned || 0);
      }
    });

    // Convertir maps a arrays
    const worlds = Array.from(worldsMap.values())
      .map(world => ({
        worldId: world.worldId,
        worldName: world.worldName,
        totalStars: world.totalStars,
        maxStars: world.maxStars,
        completedLevels: world.completedLevels,
        totalLevels: world.totalLevels,
        levels: Array.from(world.levels.values())
      }))
      .sort((a, b) => {
        const aOrder = worldsData.find((w: any) => w.world_id === a.worldId)?.order_num || 0;
        const bOrder = worldsData.find((w: any) => w.world_id === b.worldId)?.order_num || 0;
        return aOrder - bOrder;
      });

    return {
      participant: {
        id: participant.id,
        fullName: participant.full_name,
        dni: participant.dni
      },
      worlds,
      totalStars: parseInt(totalStarsData[0]?.total_stars) || 0,
      totalMaxStars: parseInt(maxStarsData[0]?.max_stars) || 0
    };
  }

  async updateParticipantAnswer(participantId: string, questionId: string, selectedAnswer: string) {
    try {
      console.log(`[UpdateAnswer] Starting - Participant: ${participantId}, Question: ${questionId}, Answer: ${selectedAnswer}`);

      // Encontrar el answer_options.id que coincida con el texto
      const answerOption = await this.dataSource.query(`
        SELECT id, is_correct
        FROM answer_options
        WHERE question_id = $1 AND "text" = $2
        LIMIT 1
      `, [questionId, selectedAnswer]);

      if (!answerOption || answerOption.length === 0) {
        throw new Error(`No se encontró la opción de respuesta: "${selectedAnswer}"`);
      }

      const answerId = answerOption[0].id;
      const isCorrect = answerOption[0].is_correct;

      console.log(`[UpdateAnswer] Found answer option - ID: ${answerId}, IsCorrect: ${isCorrect}`);

      // Usar UPSERT (INSERT ON CONFLICT) para garantizar que se guarda
      const result = await this.dataSource.query(`
        INSERT INTO participant_answers (participant_id, question_id, answer_id, is_correct, answered_at)
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (participant_id, question_id) 
        DO UPDATE SET 
          answer_id = $3, 
          is_correct = $4, 
          answered_at = NOW()
        RETURNING *
      `, [participantId, questionId, answerId, isCorrect]);

      if (!result || result.length === 0) {
        throw new Error('Error: La base de datos no devolvió el registro guardado');
      }

      const savedRecord = result[0];
      console.log(`[UpdateAnswer] Successfully saved - ID: ${savedRecord.id}, AnswerId: ${savedRecord.answer_id}, IsCorrect: ${savedRecord.is_correct}`);

      // Verificar que el answer_id sea el correcto
      if (String(savedRecord.answer_id) !== String(answerId)) {
        throw new Error(`Error crítico: El answer_id no coincide. Esperado: ${answerId}, Guardado: ${savedRecord.answer_id}`);
      }

      // Recalcular estrellas en cascada: pregunta → misión → nivel → mundo
      console.log(`[UpdateAnswer] Starting star recalculation...`);
      await this.recalculateStarsInCascade(participantId, questionId);

      // Obtener estadísticas actualizadas
      const updatedStats = await this.getUpdatedStars(participantId);
      console.log(`[UpdateAnswer] Complete - Total stars: ${updatedStats.totalStars}`);

      return {
        success: true,
        message: 'Respuesta actualizada correctamente',
        isCorrect,
        selectedAnswer,
        updatedStats,
        debug: {
          answerId,
          savedRecordId: savedRecord.id,
        }
      };
    } catch (error: any) {
      console.error('[UpdateAnswer ERROR]:', error.message);
      console.error('[UpdateAnswer ERROR Stack]:', error.stack);
      throw error;
    }
  }

  private async recalculateStarsInCascade(participantId: string, questionId: string) {
    try {
      // Obtener misionId de la pregunta
      const missionRes = await this.dataSource.query(
        `SELECT mission_id FROM questions WHERE id = $1`,
        [questionId]
      );

      if (!missionRes || missionRes.length === 0) {
        return;
      }

      const missionId = missionRes[0].mission_id;

      // Recalcular progreso de misión
      const missionProgress = await this.recalculateMissionProgress(participantId, missionId);

      // Si la misión se completó, recalcular nivel
      if (missionProgress.isCompleted) {
        const levelRes = await this.dataSource.query(
          `SELECT level_id FROM missions WHERE id = $1`,
          [missionId]
        );

        if (levelRes && levelRes.length > 0) {
          const levelId = levelRes[0].level_id;
          const levelProgress = await this.recalculateLevelProgress(participantId, levelId);

          // Si el nivel se completó, recalcular mundo
          if (levelProgress.isCompleted) {
            const worldRes = await this.dataSource.query(
              `SELECT world_id FROM levels WHERE id = $1`,
              [levelId]
            );

            if (worldRes && worldRes.length > 0) {
              const worldId = worldRes[0].world_id;
              await this.recalculateWorldProgress(participantId, worldId);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error recalculando estrellas:', error);
      // No fallar la respuesta si hay error en recalcular
    }
  }

  private async recalculateMissionProgress(participantId: string, missionId: string) {
    // Contar preguntas totales
    const [totalQ] = await this.dataSource.query(
      `SELECT COUNT(*) as cnt FROM questions WHERE mission_id = $1 AND is_active = TRUE`,
      [missionId]
    );

    // Contar preguntas respondidas
    const [answeredQ] = await this.dataSource.query(
      `SELECT COUNT(DISTINCT pa.question_id) as cnt FROM participant_answers pa
       WHERE pa.participant_id = $1 AND pa.question_id IN (
         SELECT id FROM questions WHERE mission_id = $2 AND is_active = TRUE
       )`,
      [participantId, missionId]
    );

    // Sumar estrellas SOLO de respuestas correctas
    const [correctQ] = await this.dataSource.query(
      `SELECT COALESCE(SUM(CASE WHEN pa.is_correct THEN 1 ELSE 0 END), 0) as cnt
       FROM participant_answers pa
       JOIN questions q ON q.id = pa.question_id
       WHERE pa.participant_id = $1 AND q.mission_id = $2 AND pa.is_correct = TRUE`,
      [participantId, missionId]
    );

    const isCompleted = parseInt(answeredQ.cnt) === parseInt(totalQ.cnt);
    const correctCount = parseInt(correctQ.cnt);

    // Determinar estrellas (3 estrellas si todas son correctas)
    let starsEarned = 0;
    if (isCompleted) {
      const incorrectCount = parseInt(answeredQ.cnt) - correctCount;
      if (incorrectCount === 0) {
        starsEarned = 3;
      } else if (incorrectCount === 1) {
        starsEarned = 2;
      } else {
        starsEarned = 1;
      }
    }

    // Actualizar o insertar progreso de misión
    await this.dataSource.query(`
      INSERT INTO participant_mission_progress (participant_id, mission_id, stars_earned, is_completed, completed_at)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (participant_id, mission_id) DO UPDATE
      SET stars_earned = $3, is_completed = $4, completed_at = CASE WHEN $4 = TRUE THEN NOW() ELSE participant_mission_progress.completed_at END
    `, [participantId, missionId, starsEarned, isCompleted, isCompleted ? new Date() : null]);

    return { isCompleted, starsEarned };
  }

  private async recalculateLevelProgress(participantId: string, levelId: string) {
    // Contar misiones totales del nivel
    const [totalM] = await this.dataSource.query(
      `SELECT COUNT(*) as cnt FROM missions WHERE level_id = $1 AND is_active = TRUE`,
      [levelId]
    );

    // Contar misiones completadas y sumar estrellas
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

    // Actualizar o insertar progreso de nivel
    await this.dataSource.query(`
      INSERT INTO participant_level_progress (participant_id, level_id, stars_earned, is_completed, completed_at)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (participant_id, level_id) DO UPDATE
      SET stars_earned = $3, is_completed = $4, completed_at = CASE WHEN $4 = TRUE THEN NOW() ELSE participant_level_progress.completed_at END
    `, [participantId, levelId, starsEarned, isCompleted, isCompleted ? new Date() : null]);

    return { isCompleted, starsEarned };
  }

  private async recalculateWorldProgress(participantId: string, worldId: string) {
    // Contar niveles totales del mundo
    const [totalL] = await this.dataSource.query(
      `SELECT COUNT(*) as cnt FROM levels WHERE world_id = $1 AND is_active = TRUE`,
      [worldId]
    );

    // Contar niveles completados y sumar estrellas
    const [levelStats] = await this.dataSource.query(
      `SELECT 
        COUNT(*) as completed_cnt,
        COALESCE(SUM(stars_earned), 0) as stars
       FROM participant_level_progress
       WHERE participant_id = $1 
         AND level_id IN (SELECT id FROM levels WHERE world_id = $2 AND is_active = TRUE)
         AND is_completed = TRUE`,
      [participantId, worldId]
    );

    const totalLevels = parseInt(totalL.cnt);
    const completedLevels = parseInt(levelStats.completed_cnt);
    const starsEarned = parseInt(levelStats.stars);
    const isCompleted = completedLevels === totalLevels;

    // Actualizar o insertar progreso de mundo
    await this.dataSource.query(`
      INSERT INTO participant_world_progress (participant_id, world_id, stars_earned, is_completed, completed_at)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (participant_id, world_id) DO UPDATE
      SET stars_earned = $3, is_completed = $4, completed_at = CASE WHEN $4 = TRUE THEN NOW() ELSE participant_world_progress.completed_at END
    `, [participantId, worldId, starsEarned, isCompleted, isCompleted ? new Date() : null]);

    return { isCompleted, starsEarned };
  }

  private async getUpdatedStars(participantId: string) {
    // Obtener total de estrellas del participante
    const [totalStars] = await this.dataSource.query(
      `SELECT COALESCE(SUM(stars_earned), 0) as total FROM participant_world_progress WHERE participant_id = $1`,
      [participantId]
    );

    return {
      totalStars: parseInt(totalStars.total),
    };
  }
}
