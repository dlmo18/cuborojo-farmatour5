import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HowToPlay } from './how-to-play.entity';
import { UpdateHowToPlayDto } from './dto/update-how-to-play.dto';

@Injectable()
export class HowToPlayService {
  constructor(@InjectRepository(HowToPlay) private repo: Repository<HowToPlay>) {}

  async get(): Promise<HowToPlay> {
    // Obtener el primer registro (solo debe haber uno)
    let record = await this.repo
      .createQueryBuilder()
      .orderBy('created_at', 'ASC')
      .limit(1)
      .getOne();
    
    // Si no existe, crear uno vacío
    if (!record) {
      record = await this.repo.save(this.repo.create({ content: '' }));
    }
    
    return record;
  }

  async update(dto: UpdateHowToPlayDto): Promise<HowToPlay> {
    const record = await this.get();
    
    await this.repo.update(record.id, {
      content: dto.content,
    });

    return this.repo.findOne({ where: { id: record.id } });
  }
}
