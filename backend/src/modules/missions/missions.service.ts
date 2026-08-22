import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mission } from './mission.entity';
import { MissionItem } from './mission-item.entity';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMissionDto {
  @ApiProperty() @IsString() @IsNotEmpty() levelId: string;
  @ApiProperty() @IsString() @IsNotEmpty() name: string;
  @ApiProperty({ required: false }) @IsOptional() description?: string;
  @ApiProperty({ required: false }) @IsOptional() imageId?: string;
  @ApiProperty() @IsNumber() orderNum: number;
}

export class CreateMissionItemDto {
  @ApiProperty() @IsString() @IsNotEmpty() title: string;
  @ApiProperty({ required: false }) @IsOptional() imageId?: string;
  @ApiProperty({ required: false }) @IsOptional() thumbnailId?: string;
  @ApiProperty({ required: false }) @IsOptional() benefits?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsArray() contentBadges?: { title: string }[];
  @ApiProperty({ required: false }) @IsOptional() detail?: string;
  @ApiProperty() @IsNumber() orderNum: number;
}

@Injectable()
export class MissionsService {
  constructor(
    @InjectRepository(Mission) private missionRepo: Repository<Mission>,
    @InjectRepository(MissionItem) private itemRepo: Repository<MissionItem>,
  ) {}

  async findByLevel(levelId: string) {
    return this.missionRepo.find({
      where: { levelId, isActive: true },
      order: { orderNum: 'ASC' },
    });
  }

  async findOne(id: string) {
    const m = await this.missionRepo.findOne({ where: { id }, relations: ['level', 'level.world'] });
    if (!m) throw new NotFoundException('Misión no encontrada');
    return m;
  }

  async findWithItems(id: string) {
    const mission = await this.findOne(id);
    const items = await this.itemRepo.find({ where: { missionId: id }, order: { orderNum: 'ASC' } });
    return { ...mission, items };
  }

  async findAll(page = 1, limit = 20, search?: string, levelId?: string) {
    const qb = this.missionRepo.createQueryBuilder('m')
      .leftJoinAndSelect('m.level', 'l')
      .leftJoinAndSelect('l.world', 'w')
      .orderBy('w.orderNum', 'ASC').addOrderBy('l.orderNum', 'ASC').addOrderBy('m.orderNum', 'ASC');

    if (search) qb.andWhere('m.name ILIKE :s', { s: `%${search}%` });
    if (levelId) qb.andWhere('m.levelId = :levelId', { levelId });

    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  create(dto: CreateMissionDto) {
    return this.missionRepo.save(this.missionRepo.create(dto));
  }

  async update(id: string, dto: Partial<CreateMissionDto>) {
    await this.findOne(id);
    await this.missionRepo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.missionRepo.update(id, { isActive: false });
    return { message: 'Misión desactivada' };
  }

  async addItem(missionId: string, dto: CreateMissionItemDto) {
    return this.itemRepo.save(this.itemRepo.create({ missionId, ...dto }));
  }

  async updateItem(itemId: string, dto: Partial<CreateMissionItemDto>) {
    await this.itemRepo.update(itemId, dto);
    return this.itemRepo.findOne({ where: { id: itemId } });
  }

  async removeItem(itemId: string) {
    await this.itemRepo.delete(itemId);
    return { message: 'Item eliminado' };
  }
}
