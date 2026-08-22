import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { AdminGuard } from '../auth/guards';

@ApiTags('reports')
@ApiBearerAuth('access-token')
@UseGuards(AdminGuard)
@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @Get('top10-participants')
  @ApiOperation({ summary: 'Top 10 participantes con más estrellas' })
  top10Participants() { return this.service.getTop10Participants(); }

  @Get('top10-groups')
  @ApiOperation({ summary: 'Top 10 grupos con más estrellas' })
  top10Groups() { return this.service.getTop10Groups(); }

  @Get('participant-summary')
  @ApiOperation({ summary: 'Resumen de progreso de todos los participantes' })
  summary(@Query('page') page = 1, @Query('limit') limit = 20, @Query('search') s?: string) {
    return this.service.getParticipantSummary(+page, +limit, s);
  }

  @Get('world-completion')
  @ApiOperation({ summary: 'Estadísticas de completitud por mundo' })
  worldCompletion() { return this.service.getWorldCompletionStats(); }

  @Get('mission-completion')
  @ApiOperation({ summary: 'Estadísticas de completitud por misión' })
  missionCompletion() { return this.service.getMissionCompletionStats(); }

  @Get('activity')
  @ApiOperation({ summary: 'Actividad diaria de los últimos N días' })
  activity(@Query('days') days = 30) { return this.service.getActivityByDay(+days); }

  @Get('group-leaderboard')
  @ApiOperation({ summary: 'Tabla de posiciones por grupo' })
  groupLeaderboard() { return this.service.getGroupLeaderboard(); }

  @Get('participant/:id')
  @ApiOperation({ summary: 'Detalle de progreso de un participante' })
  participantDetail(@Param('id') id: string) { return this.service.getParticipantDetail(id); }
}
