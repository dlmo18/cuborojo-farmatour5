import {
  Controller, Get, Post, Put, Delete, Param, Body, Query,
  UseGuards, UseInterceptors, UploadedFile, ParseFilePipe, FileTypeValidator
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { memoryStorage } from 'multer';
import { ParticipantsService, CreateParticipantDto, UpdateParticipantDto } from './participants.service';
import { AdminGuard, ManagerGuard } from '../auth/guards';

@ApiTags('participants')
@ApiBearerAuth('access-token')
@UseGuards(AdminGuard)
@Controller('participants')
export class ParticipantsController {
  constructor(private readonly service: ParticipantsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar participantes con paginación' })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('search') search?: string,
    @Query('groupId') groupId?: string,
  ) {
    return this.service.findAll(+page, +limit, search, groupId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener participante por ID' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Crear participante' })
  create(@Body() dto: CreateParticipantDto) {
    return this.service.create(dto);
  }

  @Put(':id')
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Actualizar participante' })
  update(@Param('id') id: string, @Body() dto: UpdateParticipantDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Desactivar participante' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post('import')
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Importar participantes desde CSV o Excel' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  importFile(@UploadedFile() file: Express.Multer.File) {
    return this.service.importFromBuffer(file.buffer, file.mimetype);
  }
}
