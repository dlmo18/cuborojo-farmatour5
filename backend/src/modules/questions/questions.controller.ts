import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { QuestionsService, CreateQuestionDto, CreateAnswerOptionDto } from './questions.service';
import { AdminGuard, ManagerGuard, ParticipantGuard } from '../auth/guards';

@ApiTags('questions')
@Controller('questions')
export class QuestionsController {
  constructor(private readonly service: QuestionsService) {}

  @Get('mission/:missionId')
  @UseGuards(ParticipantGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Preguntas de una misión para participante (sin respuestas correctas)' })
  findForParticipant(@Param('missionId') missionId: string) {
    return this.service.findByMission(missionId, true);
  }

  @Get('mission/:missionId/admin')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Preguntas con respuestas correctas (admin)' })
  findForAdmin(@Param('missionId') missionId: string) {
    return this.service.findByMission(missionId, false);
  }

  @Get(':id')
  @UseGuards(AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Obtener pregunta completa' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear pregunta' })
  create(@Body() dto: CreateQuestionDto) { return this.service.create(dto); }

  @Put(':id')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar pregunta' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateQuestionDto>) { return this.service.update(id, dto); }

  @Delete(':id')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Desactivar pregunta' })
  remove(@Param('id') id: string) { return this.service.remove(id); }

  @Post(':id/options')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Agregar opción de respuesta' })
  addOption(@Param('id') id: string, @Body() dto: CreateAnswerOptionDto) { return this.service.addOption(id, dto); }

  @Put('options/:optionId')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar opción de respuesta' })
  updateOption(@Param('optionId') optionId: string, @Body() dto: Partial<CreateAnswerOptionDto>) { return this.service.updateOption(optionId, dto); }

  @Delete('options/:optionId')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar opción de respuesta' })
  removeOption(@Param('optionId') optionId: string) { return this.service.removeOption(optionId); }
}
