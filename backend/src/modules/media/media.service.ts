import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MediaItem } from './media.entity';
import { join } from 'path';
import { unlink } from 'fs/promises';

@Injectable()
export class MediaService {
  constructor(@InjectRepository(MediaItem) private repo: Repository<MediaItem>) {}

  private getMediaType(mimetype: string): 'image' | 'video' | 'audio' | 'document' {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('audio/')) return 'audio';
    return 'document';
  }

  async upload(file: Express.Multer.File, userId: string, baseUrl: string): Promise<MediaItem> {
    const url = `${baseUrl}/uploads/${file.filename}`;
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
    const filePath = join(process.env.UPLOAD_DIR || './uploads', filename);
    try { await unlink(filePath); } catch {}
    await this.repo.delete(id);
    return { message: 'Archivo eliminado' };
  }
}
