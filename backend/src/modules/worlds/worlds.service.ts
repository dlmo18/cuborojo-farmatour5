import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { World } from './world.entity';
import { IsString, IsOptional, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateWorldDto {
  @ApiProperty() @IsString() @IsNotEmpty() name: string;
  @ApiProperty({ required: false }) @IsOptional() description?: string;
  @ApiProperty({ required: false }) @IsOptional() imageId?: string;
  @ApiProperty() @IsNumber() orderNum: number;
}

@Injectable()
export class WorldsService {
  constructor(@InjectRepository(World) private repo: Repository<World>) {}

  findAll(page = 1, limit = 20) {
    const qb = this.repo.createQueryBuilder().orderBy('order_num', 'ASC');
    return qb.skip((page - 1) * limit).take(limit).getManyAndCount().then(([data, total]) => ({
      data, total, page, limit, pages: Math.ceil(total / limit),
    }));
  }

  async findOne(id: string) {
    const w = await this.repo.findOne({ where: { id } });
    if (!w) throw new NotFoundException('Mundo no encontrado');
    return w;
  }

  create(dto: CreateWorldDto) { return this.repo.save(this.repo.create(dto)); }

  async update(id: string, dto: Partial<CreateWorldDto>) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.repo.update(id, { isActive: false });
    return { message: 'Mundo desactivado' };
  }
}
