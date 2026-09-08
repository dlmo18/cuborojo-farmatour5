import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import {
  LevelsService,
  CreateLevelDto,
  UpdateLevelDto,
  CreateGoldenLevelItemDto,
  UpdateGoldenLevelItemDto,
  CreateGoldenLevelQuestionDto,
  UpdateGoldenLevelQuestionDto,
  CreateGoldenLevelAnswerOptionDto,
  UpdateGoldenLevelAnswerOptionDto,
  CreateFinalLevelQuestionDto,
  UpdateFinalLevelQuestionDto,
  CreateFinalLevelAnswerOptionDto,
  UpdateFinalLevelAnswerOptionDto,
  CreateLevelItemDto,
  UpdateLevelItemDto,
} from './levels.service';
import { GoldenLevelsService } from './golden-levels.service';
import { FinalLevelsService } from './final-levels.service';
import { AdminGuard, ManagerGuard } from '../auth/guards';

@ApiTags('levels')
@Controller('levels')
export class LevelsController {
  constructor(
    private readonly service: LevelsService,
    private readonly goldenService: GoldenLevelsService,
    private readonly finalService: FinalLevelsService,
  ) {}

  // ============================================================
  // NIVELES - CRUD GENERAL
  // ============================================================

  @Get('world/:worldId')
  @ApiOperation({ summary: 'Niveles de un mundo (público para participantes)' })
  findByWorld(@Param('worldId') worldId: string) {
    return this.service.findByWorld(worldId);
  }

  @Get()
  @UseGuards(AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Listar todos los niveles (admin)' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 20, @Query('worldId') w?: string) {
    return this.service.findAll(+page, +limit, w);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener nivel por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear nivel' })
  create(@Body() dto: CreateLevelDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar nivel' })
  update(@Param('id') id: string, @Body() dto: Partial<UpdateLevelDto>) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Desactivar nivel' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  // ============================================================
  // GOLDEN LEVELS - ITEMS
  // ============================================================

  @Get('golden/:levelId/items')
  @ApiOperation({ summary: 'Obtener items de un nivel dorado' })
  getGoldenItems(@Param('levelId') levelId: string) {
    return this.goldenService.getItemsByLevel(levelId);
  }

  @Post('golden/items')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear item de nivel dorado' })
  createGoldenItem(@Body() dto: CreateGoldenLevelItemDto) {
    return this.goldenService.createItem(dto);
  }

  @Put('golden/items/:id')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar item de nivel dorado' })
  updateGoldenItem(@Param('id') id: string, @Body() dto: UpdateGoldenLevelItemDto) {
    return this.goldenService.updateItem(id, dto);
  }

  @Delete('golden/items/:id')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar item de nivel dorado' })
  deleteGoldenItem(@Param('id') id: string) {
    return this.goldenService.deleteItem(id);
  }

  // ============================================================
  // GOLDEN LEVELS - PREGUNTAS
  // ============================================================

  @Get('golden/:levelId/questions')
  @ApiOperation({ summary: 'Obtener preguntas de un nivel dorado' })
  getGoldenQuestions(@Param('levelId') levelId: string) {
    return this.goldenService.getQuestionsByLevel(levelId);
  }

  @Post('golden/questions')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear pregunta de nivel dorado' })
  createGoldenQuestion(@Body() dto: CreateGoldenLevelQuestionDto) {
    return this.goldenService.createQuestion(dto);
  }

  @Put('golden/questions/:id')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar pregunta de nivel dorado' })
  updateGoldenQuestion(@Param('id') id: string, @Body() dto: UpdateGoldenLevelQuestionDto) {
    return this.goldenService.updateQuestion(id, dto);
  }

  @Delete('golden/questions/:id')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar pregunta de nivel dorado' })
  deleteGoldenQuestion(@Param('id') id: string) {
    return this.goldenService.deleteQuestion(id);
  }

  // ============================================================
  // GOLDEN LEVELS - OPCIONES DE RESPUESTA
  // ============================================================

  @Get('golden/questions/:questionId/answers')
  @ApiOperation({ summary: 'Obtener opciones de respuesta de una pregunta dorada' })
  getGoldenAnswers(@Param('questionId') questionId: string) {
    return this.goldenService.getAnswerOptionsByQuestion(questionId);
  }

  @Post('golden/answers')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear opción de respuesta para pregunta dorada' })
  createGoldenAnswer(@Body() dto: CreateGoldenLevelAnswerOptionDto) {
    return this.goldenService.createAnswerOption(dto);
  }

  @Put('golden/answers/:id')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar opción de respuesta dorada' })
  updateGoldenAnswer(@Param('id') id: string, @Body() dto: UpdateGoldenLevelAnswerOptionDto) {
    return this.goldenService.updateAnswerOption(id, dto);
  }

  @Delete('golden/answers/:id')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar opción de respuesta dorada' })
  deleteGoldenAnswer(@Param('id') id: string) {
    return this.goldenService.deleteAnswerOption(id);
  }

  // ============================================================
  // FINAL LEVELS - PREGUNTAS
  // ============================================================

  @Get('final/:levelId/questions')
  @ApiOperation({ summary: 'Obtener preguntas de un nivel final' })
  getFinalQuestions(@Param('levelId') levelId: string) {
    return this.finalService.getQuestionsByLevel(levelId);
  }

  @Post('final/questions')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear pregunta de nivel final' })
  createFinalQuestion(@Body() dto: CreateFinalLevelQuestionDto) {
    return this.finalService.createQuestion(dto);
  }

  @Put('final/questions/:id')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar pregunta de nivel final' })
  updateFinalQuestion(@Param('id') id: string, @Body() dto: UpdateFinalLevelQuestionDto) {
    return this.finalService.updateQuestion(id, dto);
  }

  @Delete('final/questions/:id')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar pregunta de nivel final' })
  deleteFinalQuestion(@Param('id') id: string) {
    return this.finalService.deleteQuestion(id);
  }

  // ============================================================
  // FINAL LEVELS - OPCIONES DE RESPUESTA
  // ============================================================

  @Get('final/questions/:questionId/answers')
  @ApiOperation({ summary: 'Obtener opciones de respuesta de una pregunta final' })
  getFinalAnswers(@Param('questionId') questionId: string) {
    return this.finalService.getAnswerOptionsByQuestion(questionId);
  }

  @Post('final/answers')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear opción de respuesta para pregunta final' })
  createFinalAnswer(@Body() dto: CreateFinalLevelAnswerOptionDto) {
    return this.finalService.createAnswerOption(dto);
  }

  @Put('final/answers/:id')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar opción de respuesta final' })
  updateFinalAnswer(@Param('id') id: string, @Body() dto: UpdateFinalLevelAnswerOptionDto) {
    return this.finalService.updateAnswerOption(id, dto);
  }

  @Delete('final/answers/:id')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar opción de respuesta final' })
  deleteFinalAnswer(@Param('id') id: string) {
    return this.finalService.deleteAnswerOption(id);
  }

  // ============================================================
  // ITEMS DE NIVEL NORMAL (CONTENIDO)
  // ============================================================

  @Get(':id/items')
  @ApiOperation({ summary: 'Obtener items de contenido de un nivel normal' })
  getItems(@Param('id') id: string) {
    return this.service.getItems(id);
  }

  @Post(':id/items')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear item de contenido en nivel normal' })
  addItem(@Param('id') id: string, @Body() dto: CreateLevelItemDto) {
    return this.service.addItem(id, dto);
  }

  @Put('items/:itemId')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar item de contenido' })
  updateItem(@Param('itemId') itemId: string, @Body() dto: UpdateLevelItemDto) {
    return this.service.updateItem(itemId, dto);
  }

  @Delete('items/:itemId')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar item de contenido' })
  removeItem(@Param('itemId') itemId: string) {
    return this.service.removeItem(itemId);
  }

  // ============================================================
  // UTILIDADES
  // ============================================================

  @Get('golden/:levelId/content')
  @ApiOperation({ summary: 'Obtener contenido completo de un nivel dorado' })
  getGoldenContent(@Param('levelId') levelId: string) {
    return this.goldenService.getLevelContent(levelId);
  }

  @Get('final/:levelId/content')
  @ApiOperation({ summary: 'Obtener contenido completo de un nivel final' })
  getFinalContent(@Param('levelId') levelId: string) {
    return this.finalService.getLevelContent(levelId);
  }
}
