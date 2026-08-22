import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LevelsService, CreateLevelDto } from './levels.service';
import { AdminGuard, ManagerGuard } from '../auth/guards';

@ApiTags('levels')
@Controller('levels')
export class LevelsController {
  constructor(private readonly service: LevelsService) {}

  @Get('world/:worldId')
  @ApiOperation({ summary: 'Niveles de un mundo (público para participantes)' })
  findByWorld(@Param('worldId') worldId: string) { return this.service.findByWorld(worldId); }

  @Get()
  @UseGuards(AdminGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Listar todos los niveles (admin)' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 20, @Query('worldId') w?: string) {
    return this.service.findAll(+page, +limit, w);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener nivel por ID' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear nivel' })
  create(@Body() dto: CreateLevelDto) { return this.service.create(dto); }

  @Put(':id')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar nivel' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateLevelDto>) { return this.service.update(id, dto); }

  @Delete(':id')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Desactivar nivel' })
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
