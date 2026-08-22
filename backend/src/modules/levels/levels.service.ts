import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Level } from './level.entity';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLevelDto {
  @ApiProperty() @IsString() @IsNotEmpty() worldId: string;
  @ApiProperty() @IsString() @IsNotEmpty() name: string;
  @ApiProperty({ required: false }) @IsOptional() description?: string;
  @ApiProperty({ required: false }) @IsOptional() imageId?: string;
  @ApiProperty() @IsNumber() orderNum: number;
  @ApiProperty({ default: false }) @IsBoolean() isGolden?: boolean;
}

@Injectable()
export class LevelsService {
  constructor(@InjectRepository(Level) private repo: Repository<Level>) {}

  async findByWorld(worldId: string) {
    return this.repo.find({ where: { worldId, isActive: true }, order: { isGolden: 'DESC', orderNum: 'DESC' } });
  }

  async findAll(page = 1, limit = 20, worldId?: string) {
    const qb = this.repo.createQueryBuilder('l')
      .leftJoinAndSelect('l.world', 'w')
      .orderBy('w.orderNum', 'ASC').addOrderBy('l.orderNum', 'ASC');
    if (worldId) qb.andWhere('l.worldId = :worldId', { worldId });
    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const l = await this.repo.findOne({ where: { id }, relations: ['world'] });
    if (!l) throw new NotFoundException('Nivel no encontrado');
    return l;
  }

  create(dto: CreateLevelDto) { return this.repo.save(this.repo.create(dto)); }

  async update(id: string, dto: Partial<CreateLevelDto>) {
    await this.findOne(id);
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.repo.update(id, { isActive: false });
    return { message: 'Nivel desactivado' };
  }
}
