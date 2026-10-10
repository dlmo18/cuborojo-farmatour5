import { Controller, Get, Post, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProgressService } from './progress.service';
import { ParticipantGuard } from '../auth/guards';

class AnswerDto {
  @ApiProperty() @IsString() @IsNotEmpty() questionId: string;
  @ApiProperty() @IsString() @IsNotEmpty() answerId: string;
}

class GoldenLevelAnswerDto {
  @ApiProperty() @IsString() @IsNotEmpty() questionId: string;
  @ApiProperty() @IsString() @IsNotEmpty() answerId: string;
}

class FinalLevelAnswerDto {
  @ApiProperty() @IsString() @IsNotEmpty() questionId: string;
  @ApiProperty() @IsString() @IsNotEmpty() answerId: string;
}

@ApiTags('progress')
@ApiBearerAuth('access-token')
@UseGuards(ParticipantGuard)
@Controller('progress')
export class ProgressController {
  constructor(private readonly service: ProgressService) {}

  @Get('game-state')
  @ApiOperation({ summary: 'Estado completo del juego del participante autenticado' })
  getGameState(@Req() req: any) {
    return this.service.getGameState(req.user.id);
  }

  @Get('worlds')
  @ApiOperation({ summary: 'Progreso en mundos del participante' })
  getWorldsProgress(@Req() req: any) {
    return this.service.getWorldsProgress(req.user.id);
  }

  @Post('answer')
  @ApiOperation({ summary: 'Responder pregunta de misión' })
  answerQuestion(@Req() req: any, @Body() dto: AnswerDto) {
    return this.service.answerQuestion(req.user.id, dto.questionId, dto.answerId);
  }

  @Post('answer/golden')
  @ApiOperation({ summary: 'Responder pregunta de nivel dorado' })
  answerGoldenLevelQuestion(@Req() req: any, @Body() dto: GoldenLevelAnswerDto) {
    return this.service.answerGoldenLevelQuestion(req.user.id, dto.questionId, dto.answerId);
  }

  @Post('answer/final')
  @ApiOperation({ summary: 'Responder pregunta de nivel final' })
  answerFinalLevelQuestion(@Req() req: any, @Body() dto: FinalLevelAnswerDto) {
    return this.service.answerFinalLevelQuestion(req.user.id, dto.questionId, dto.answerId);
  }

  @Get('mission/:missionId/answers')
  @ApiOperation({ summary: 'Obtener respuestas del participante para una misión específica' })
  getMissionAnswers(@Req() req: any, @Param('missionId') missionId: string) {
    return this.service.getMissionAnswers(req.user.id, missionId);
  }

  @Get('golden-level/:levelId/answers')
  @ApiOperation({ summary: 'Obtener respuestas del participante para un nivel dorado específico' })
  getGoldenLevelAnswers(@Req() req: any, @Param('levelId') levelId: string) {
    return this.service.getGoldenLevelAnswers(req.user.id, levelId);
  }

  @Post('complete-mission')
  @ApiOperation({ summary: 'Marcar misión como completada' })
  completeMission(@Req() req: any, @Body() dto: any) {
    return this.service.completeMission(req.user.id, dto.missionId);
  }

  @Get('group-ranking')
  @ApiOperation({ summary: 'Ranking del grupo del participante (top 10 + posición propia)' })
  getGroupRanking(@Req() req: any) {
    return this.service.getGroupRanking(req.user.id);
  }
}
