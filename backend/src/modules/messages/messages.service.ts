import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from './message.entity';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class MessagesService {
  constructor(@InjectRepository(Message) private repo: Repository<Message>) {}

  async findAll(page = 1, limit = 10, search?: string) {
    const qb = this.repo.createQueryBuilder('m').orderBy('m.createdAt', 'DESC');
    
    if (search) {
      qb.where(
        'm.fullName ILIKE :s OR m.email ILIKE :s OR m.subject ILIKE :s',
        { s: `%${search}%` }
      );
    }
    
    const [data, total] = await qb
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const message = await this.repo.findOne({ where: { id } });
    if (!message) throw new NotFoundException('Mensaje no encontrado');
    return message;
  }

  create(dto: CreateMessageDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.repo.delete(id);
    return { message: 'Mensaje eliminado' };
  }
}
