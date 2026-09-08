import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { ActivityLog } from '../progress/activity-log.entity';
import { AdminGuard } from '../auth/guards';

@Injectable()
export class ReportsService {
  constructor(private dataSource: DataSource) {}

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
}
