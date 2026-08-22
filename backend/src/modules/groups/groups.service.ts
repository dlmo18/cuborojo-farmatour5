import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './group.entity';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateGroupDto {
  @ApiProperty() @IsString() @IsNotEmpty() name: string;
  @ApiProperty({ required: false }) @IsOptional() description?: string;
}

@Injectable()
export class GroupsService {
  constructor(@InjectRepository(Group) private repo: Repository<Group>) {}

  findAll(page = 1, limit = 20, search?: string) {
    const qb = this.repo.createQueryBuilder('g').orderBy('g.name', 'ASC');
    if (search) qb.where('g.name ILIKE :s', { s: `%${search}%` });
    return qb.skip((page - 1) * limit).take(limit).getManyAndCount().then(([data, total]) => ({
      data, total, page, limit, pages: Math.ceil(total / limit),
    }));
  }

  async findOne(id: string) {
    const g = await this.repo.findOne({ where: { id } });
    if (!g) throw new NotFoundException('Grupo no encontrado');
    return g;
  }

  create(dto: CreateGroupDto) {
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: Partial<CreateGroupDto>) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.repo.update(id, { isActive: false });
    return { message: 'Grupo desactivado' };
  }
}
