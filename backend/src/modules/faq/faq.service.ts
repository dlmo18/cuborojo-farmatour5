import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FaqItem } from './faq.entity';
import { CreateFaqItemDto } from './dto/create-faq-item.dto';
import { UpdateFaqItemDto } from './dto/update-faq-item.dto';

@Injectable()
export class FaqService {
  constructor(@InjectRepository(FaqItem) private repo: Repository<FaqItem>) {}

  findAll(page = 1, limit = 10, search?: string) {
    const qb = this.repo.createQueryBuilder('f').orderBy('f.orderNum', 'ASC');
    
    if (search) {
      qb.where('f.title ILIKE :s OR f.detail ILIKE :s', { s: `%${search}%` });
    }
    
    return qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount()
      .then(([data, total]) => ({
        data,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      }));
  }

  async findOne(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Pregunta frecuente no encontrada');
    return item;
  }

  create(dto: CreateFaqItemDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateFaqItemDto) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete(id);
    return { message: 'Pregunta eliminada' };
  }

  async getPublic() {
    return this.repo.find({ order: { orderNum: 'ASC' } });
  }
}
