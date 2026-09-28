import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { MessagesService } from './messages.service';
import { ManagerGuard } from '../auth/guards';
import { CreateMessageDto } from './dto/create-message.dto';

@ApiTags('messages')
@Controller('messages')
export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  @Get()
  @ApiBearerAuth('access-token')
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Obtener todos los mensajes (paginados)' })
  async findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 10,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(page, limit, search);
  }

  @Get(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Obtener un mensaje por ID' })
  async findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo mensaje (público)' })
  async create(@Body() dto: CreateMessageDto) {
    return this.service.create(dto);
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Eliminar un mensaje' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
