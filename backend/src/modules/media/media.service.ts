import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { MediaItem } from './media.entity';
import { join, isAbsolute } from 'path';
import { unlink } from 'fs/promises';

@Injectable()
export class MediaService {
  constructor(
    @InjectRepository(MediaItem) private repo: Repository<MediaItem>,
    private configService: ConfigService,
  ) {}

  private getMediaType(mimetype: string): 'image' | 'video' | 'audio' | 'document' {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('audio/')) return 'audio';
    return 'document';
  }

  async upload(file: Express.Multer.File, userId: string, baseUrl: string): Promise<MediaItem> {
    const url = `${baseUrl}/api/media/file/${file.filename}`;
    const item = this.repo.create({
      name: file.originalname,
      type: this.getMediaType(file.mimetype),
      url,
      fileSize: file.size,
      mimeType: file.mimetype,
      uploadedBy: userId,
    });
    return this.repo.save(item);
  }

  async uploadMultiple(files: Express.Multer.File[], userId: string, baseUrl: string): Promise<MediaItem[]> {
    const items = files.map(file => {
      const url = `${baseUrl}/api/media/file/${file.filename}`;
      return this.repo.create({
        name: file.originalname,
        type: this.getMediaType(file.mimetype),
        url,
        fileSize: file.size,
        mimeType: file.mimetype,
        uploadedBy: userId,
      });
    });
    return this.repo.save(items);
  }

  async findAll(page = 1, limit = 20, type?: string, search?: string) {
    const qb = this.repo.createQueryBuilder('m').orderBy('m.createdAt', 'DESC');
    if (type) qb.andWhere('m.type = :type', { type });
    if (search) qb.andWhere('m.name ILIKE :s', { s: `%${search}%` });
    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const m = await this.repo.findOne({ where: { id } });
    if (!m) throw new NotFoundException('Archivo no encontrado');
    return m;
  }

  async remove(id: string) {
    const m = await this.findOne(id);
    const filename = m.url.split('/').pop();
    
    const uploadDirConfig = this.configService.get('UPLOAD_DIR', './uploads');
    const uploadDir = isAbsolute(uploadDirConfig) ? uploadDirConfig : join(process.cwd(), uploadDirConfig);
    const filePath = join(uploadDir, filename);
    
    try { 
      await unlink(filePath);
      console.log(`[Media] File deleted: ${filePath}`);
    } catch (e) {
      console.error('[Media] Error deleting file:', e);
    }
    
    await this.repo.delete(id);
    return { message: 'Archivo eliminado' };
  }
}
