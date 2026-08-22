import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MissionsService, CreateMissionDto, CreateMissionItemDto } from './missions.service';
import { AdminGuard, ManagerGuard, ParticipantGuard } from '../auth/guards';

@ApiTags('missions')
@Controller('missions')
export class MissionsController {
  constructor(private readonly service: MissionsService) {}

  @Get()
  @UseGuards(AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Listar todas las misiones (admin)' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 20, @Query('search') s?: string, @Query('levelId') l?: string) {
    return this.service.findAll(+page, +limit, s, l);
  }

  @Get('level/:levelId')
  @ApiOperation({ summary: 'Misiones de un nivel (público para participantes)' })
  findByLevel(@Param('levelId') levelId: string) {
    return this.service.findByLevel(levelId);
  }

  @Get(':id/detail')
  @ApiOperation({ summary: 'Misión con items de información' })
  findWithItems(@Param('id') id: string) {
    return this.service.findWithItems(id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener misión por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear misión' })
  create(@Body() dto: CreateMissionDto) { return this.service.create(dto); }

  @Put(':id')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar misión' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateMissionDto>) { return this.service.update(id, dto); }

  @Delete(':id')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Desactivar misión' })
  remove(@Param('id') id: string) { return this.service.remove(id); }

  @Post(':id/items')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Agregar item de información a misión' })
  addItem(@Param('id') id: string, @Body() dto: CreateMissionItemDto) { return this.service.addItem(id, dto); }

  @Put('items/:itemId')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar item de misión' })
  updateItem(@Param('itemId') itemId: string, @Body() dto: Partial<CreateMissionItemDto>) { return this.service.updateItem(itemId, dto); }

  @Delete('items/:itemId')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Eliminar item de misión' })
  removeItem(@Param('itemId') itemId: string) { return this.service.removeItem(itemId); }
}
