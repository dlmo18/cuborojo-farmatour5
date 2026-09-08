import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { WorldsService, CreateWorldDto } from './worlds.service';
import { AdminGuard, ManagerGuard } from '../auth/guards';

@ApiTags('worlds')
@Controller('worlds')
export class WorldsController {
  constructor(private readonly service: WorldsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar mundos (disponible para todos)' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 20) {
    return this.service.findAll(+page, +limit);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener mundo por ID' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Crear mundo' })
  create(@Body() dto: CreateWorldDto) { return this.service.create(dto); }

  @Put(':id')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Actualizar mundo' })
  update(@Param('id') id: string, @Body() dto: Partial<CreateWorldDto>) { return this.service.update(id, dto); }

  @Delete(':id')
  @UseGuards(ManagerGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Desactivar mundo' })
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
