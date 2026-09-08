import { Controller, Get, Post, Delete, Param, Query, UseGuards, UseInterceptors, UploadedFile, UploadedFiles, Req, BadRequestException, Res, HttpCode, HttpStatus } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
import { MediaService } from './media.service';
import { AdminGuard, ManagerGuard } from '../auth/guards';
import { Request, Response } from 'express';
import { createReadStream, existsSync } from 'fs';
import { join, isAbsolute } from 'path';
import { ConfigService } from '@nestjs/config';

@ApiTags('media')
@ApiBearerAuth('access-token')
@Controller('media')
export class MediaController {
  constructor(
    private readonly service: MediaService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  @UseGuards(AdminGuard)
  @ApiOperation({ summary: 'Listar biblioteca de medios' })
  @ApiQuery({ name: 'page', required: false, type: 'number' })
  @ApiQuery({ name: 'limit', required: false, type: 'number' })
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

  @Get('file/:filename')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Descargar archivo de la biblioteca' })
  async downloadFile(
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    try {
      const uploadDirConfig = this.configService.get('UPLOAD_DIR', './uploads');
      const uploadDir = isAbsolute(uploadDirConfig) ? uploadDirConfig : join(process.cwd(), uploadDirConfig);
      const filePath = join(uploadDir, filename);

      console.log(`[Media] Attempting to download: ${filename}`);
      console.log(`[Media] Upload dir: ${uploadDir}`);
      console.log(`[Media] Full path: ${filePath}`);

      // Security: prevent directory traversal
      if (!filePath.startsWith(uploadDir) || filename.includes('..')) {
        console.error(`[Media] Security violation attempt: ${filePath}`);
        return res.status(HttpStatus.FORBIDDEN).json({ error: 'Acceso denegado' });
      }

      if (!existsSync(filePath)) {
        console.error(`[Media] File not found: ${filePath}`);
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'Archivo no encontrado' });
      }

      const stream = createReadStream(filePath);
      stream.on('error', (error) => {
        console.error(`[Media] Stream error for ${filePath}:`, error);
        if (!res.headersSent) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Error al descargar archivo' });
        }
      });
      stream.pipe(res);
    } catch (error) {
      console.error('[Media] Controller error:', error);
      if (!res.headersSent) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Error al descargar archivo' });
      }
    }
  }

  @Get('serve/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Servir media por ID (público)' })
  async serveMediaById(
    @Param('id') id: string,
    @Res() res: Response,
  ) {
    try {
      const media = await this.service.findOne(id);
      const filename = media.url.split('/').pop();
      
      const uploadDirConfig = this.configService.get('UPLOAD_DIR', './uploads');
      const uploadDir = isAbsolute(uploadDirConfig) ? uploadDirConfig : join(process.cwd(), uploadDirConfig);
      const filePath = join(uploadDir, filename);

      console.log(`[Media] Serving: ${filename}`);

      if (!filePath.startsWith(uploadDir) || filename.includes('..')) {
        return res.status(HttpStatus.FORBIDDEN).json({ error: 'Acceso denegado' });
      }

      if (!existsSync(filePath)) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: 'Archivo no encontrado' });
      }

      const stream = createReadStream(filePath);
      res.setHeader('Content-Type', media.mimeType || 'application/octet-stream');
      stream.on('error', (error) => {
        console.error(`[Media] Stream error for ${filePath}:`, error);
        if (!res.headersSent) {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Error al servir archivo' });
        }
      });
      stream.pipe(res);
    } catch (error) {
      console.error('[Media] Serve error:', error);
      if (!res.headersSent) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Error al servir archivo' });
      }
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener información del media por ID' })
  findOne(@Param('id') id: string) { 
    return this.service.findOne(id); 
  }

  @Post('upload')
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Subir archivo a la biblioteca de medios' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { file: { type: 'string', format: 'binary' } } } })
  @UseInterceptors(FileInterceptor('file'))
  upload(@UploadedFile() file: Express.Multer.File, @Req() req: Request & { user: any }) {
    if (!file) throw new BadRequestException('No file uploaded');
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return this.service.upload(file, req.user.id, baseUrl);
  }

  @Post('upload-multiple')
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Subir múltiples archivos a la biblioteca de medios' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ schema: { type: 'object', properties: { files: { type: 'array', items: { type: 'string', format: 'binary' } } } } })
  @UseInterceptors(FilesInterceptor('files', 20))
  uploadMultiple(@UploadedFiles() files: Express.Multer.File[], @Req() req: Request & { user: any }) {
    if (!files || files.length === 0) throw new BadRequestException('No files uploaded');
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    return this.service.uploadMultiple(files, req.user.id, baseUrl);
  }

  @Delete(':id')
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Eliminar archivo de la biblioteca' })
  remove(@Param('id') id: string) { 
    return this.service.remove(id); 
  }
}
