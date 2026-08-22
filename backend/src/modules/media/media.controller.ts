import { Controller, Get, Post, Delete, Param, Query, UseGuards, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { AdminGuard, ManagerGuard } from '../auth/guards';
import { Request } from 'express';

@ApiTags('media')
@ApiBearerAuth('access-token')
@UseGuards(AdminGuard)
@Controller('media')
export class MediaController {
  constructor(private readonly service: MediaService) {}

  @Get()
  @ApiOperation({ summary: 'Listar biblioteca de medios' })
  @ApiQuery({ name: 'type', required: false, enum: ['image', 'video', 'audio', 'document'] })
  @ApiQuery({ name: 'search', required: false })
  findAll(
    @Query('page') page = 1,
    @Query('limit') limit = 20,
    @Query('type') type?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(+page, +limit, type, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener media por ID' })
  findOne(@Param('id') id: string) { return this.service.findOne(id); }

  @Post('upload')
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Subir archivo a la biblioteca de medios' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File, @Req() req: Request & { user: any }) {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return this.service.upload(file, req.user.id, baseUrl);
  }

  @Delete(':id')
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Eliminar archivo de la biblioteca' })
  remove(@Param('id') id: string) { return this.service.remove(id); }
}
