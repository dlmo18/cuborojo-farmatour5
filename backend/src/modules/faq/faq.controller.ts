import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FaqService } from './faq.service';
import { ManagerGuard } from '../auth/guards';
import { CreateFaqItemDto } from './dto/create-faq-item.dto';
import { UpdateFaqItemDto } from './dto/update-faq-item.dto';

@ApiTags('faq')
@Controller('faq')
export class FaqController {
  constructor(private readonly service: FaqService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las preguntas frecuentes (paginadas)' })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(page, limit, search);
  }

  @Get('public')
  @ApiOperation({ summary: 'Obtener todas las preguntas frecuentes (públicas, sin paginación)' })
  async getPublic() {
    return this.service.getPublic();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener una pregunta frecuente por ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiBearerAuth('access-token')
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Crear una nueva pregunta frecuente' })
  async create(@Body() dto: CreateFaqItemDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Actualizar una pregunta frecuente' })
  async update(@Param('id') id: string, @Body() dto: UpdateFaqItemDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Eliminar una pregunta frecuente' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
