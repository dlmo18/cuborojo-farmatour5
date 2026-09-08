import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GroupsService, CreateGroupDto } from './groups.service';
import { AdminGuard, ManagerGuard, ParticipantGuard } from '../auth/guards';

@ApiTags('groups')
@Controller('groups')
export class GroupsController {
  constructor(private readonly service: GroupsService) {}

  @Get()
  @ApiBearerAuth('access-token')
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Listar grupos' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 20, @Query('search') search?: string) {
    return this.service.findAll(+page, +limit, search);
  }

  @Get(':id/ranking')
  @ApiBearerAuth('access-token')
  @UseGuards(ParticipantGuard)
  @ApiOperation({ summary: 'Obtener ranking de un grupo' })
  getRanking(@Param('id') id: string) { return this.service.getRanking(id); }

  @Get(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(AdminGuard)
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @ApiBearerAuth('access-token')
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Crear grupo' })
  create(@Body() dto: CreateGroupDto) { return this.service.create(dto); }

  @Put(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(ManagerGuard)
  update(@Param('id') id: string, @Body() dto: CreateGroupDto) { return this.service.update(id, dto); }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(ManagerGuard)
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
