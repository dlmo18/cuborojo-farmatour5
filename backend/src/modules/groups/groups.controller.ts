import { Controller, Get, Post, Put, Delete, Param, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GroupsService, CreateGroupDto } from './groups.service';
import { AdminGuard, ManagerGuard } from '../auth/guards';

@ApiTags('groups')
@ApiBearerAuth('access-token')
@UseGuards(AdminGuard)
@Controller('groups')
export class GroupsController {
  constructor(private readonly service: GroupsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar grupos' })
  findAll(@Query('page') page = 1, @Query('limit') limit = 20, @Query('search') search?: string) {
    return this.service.findAll(+page, +limit, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post()
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Crear grupo' })
  create(@Body() dto: CreateGroupDto) { return this.service.create(dto); }

  @Put(':id')
  @UseGuards(ManagerGuard)
  update(@Param('id') id: string, @Body() dto: CreateGroupDto) { return this.service.update(id, dto); }

  @Delete(':id')
  @UseGuards(ManagerGuard)
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
