import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Level, LevelType } from './level.entity';
import { LevelItem } from './level-item.entity';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLevelDto {
  @ApiProperty() @IsString() @IsNotEmpty() worldId: string;
  @ApiProperty() @IsString() @IsNotEmpty() name: string;
  @ApiProperty({ required: false }) @IsOptional() description?: string;
  @ApiProperty({ required: false }) @IsOptional() imageId?: string;
  @ApiProperty() @IsNumber() orderNum: number;
  @ApiProperty({ enum: LevelType, default: LevelType.NORMAL }) @IsOptional() @IsEnum(LevelType) levelType?: LevelType;
  @ApiProperty({ default: false, required: false }) @IsOptional() @IsBoolean() isGolden?: boolean;
  @ApiProperty({ required: false }) @IsOptional() introVideoUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() introVideoId?: string;
}

export class UpdateLevelDto {
  @ApiProperty({ required: false }) @IsOptional() worldId?: string;
  @ApiProperty({ required: false }) @IsOptional() name?: string;
  @ApiProperty({ required: false }) @IsOptional() description?: string;
  @ApiProperty({ required: false }) @IsOptional() imageId?: string;
  @ApiProperty({ required: false }) @IsOptional() orderNum?: number;
  @ApiProperty({ required: false, enum: LevelType }) @IsOptional() @IsEnum(LevelType) levelType?: LevelType;
  @ApiProperty({ required: false }) @IsOptional() @IsBoolean() isGolden?: boolean;
  @ApiProperty({ required: false }) @IsOptional() introVideoUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() introVideoId?: string;
  @ApiProperty({ required: false }) @IsOptional() isActive?: boolean;
}

export class CreateGoldenLevelItemDto {
  @ApiProperty() @IsString() @IsNotEmpty() levelId: string;
  @ApiProperty() @IsString() @IsNotEmpty() title: string;
  @ApiProperty({ required: false }) @IsOptional() detail?: string;
  @ApiProperty() @IsNumber() orderNum: number;
}

export class UpdateGoldenLevelItemDto {
  @ApiProperty({ required: false }) @IsOptional() title?: string;
  @ApiProperty({ required: false }) @IsOptional() detail?: string;
  @ApiProperty({ required: false }) @IsOptional() orderNum?: number;
}

export class CreateGoldenLevelQuestionDto {
  @ApiProperty() @IsString() @IsNotEmpty() levelId: string;
  @ApiProperty() @IsString() @IsNotEmpty() content: string;
  @ApiProperty() @IsNumber() orderNum: number;
}

export class UpdateGoldenLevelQuestionDto {
  @ApiProperty({ required: false }) @IsOptional() content?: string;
  @ApiProperty({ required: false }) @IsOptional() orderNum?: number;
  @ApiProperty({ required: false }) @IsOptional() isActive?: boolean;
}

export class CreateGoldenLevelAnswerOptionDto {
  @ApiProperty() @IsString() @IsNotEmpty() questionId: string;
  @ApiProperty() @IsString() @IsNotEmpty() text: string;
  @ApiProperty() @IsBoolean() isCorrect: boolean;
  @ApiProperty() @IsNumber() orderNum: number;
}

export class UpdateGoldenLevelAnswerOptionDto {
  @ApiProperty({ required: false }) @IsOptional() text?: string;
  @ApiProperty({ required: false }) @IsOptional() isCorrect?: boolean;
  @ApiProperty({ required: false }) @IsOptional() orderNum?: number;
}

export class CreateFinalLevelQuestionDto {
  @ApiProperty() @IsString() @IsNotEmpty() levelId: string;
  @ApiProperty() @IsString() @IsNotEmpty() content: string;
  @ApiProperty({ required: false }) @IsOptional() startVideoUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() startVideoId?: string;
  @ApiProperty({ required: false }) @IsOptional() endVideoUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() endVideoId?: string;
  @ApiProperty({ required: false }) @IsOptional() correctMessage?: string;
  @ApiProperty({ required: false }) @IsOptional() incorrectMessage?: string;
  @ApiProperty() @IsNumber() orderNum: number;
}

export class UpdateFinalLevelQuestionDto {
  @ApiProperty({ required: false }) @IsOptional() content?: string;
  @ApiProperty({ required: false }) @IsOptional() startVideoUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() startVideoId?: string;
  @ApiProperty({ required: false }) @IsOptional() endVideoUrl?: string;
  @ApiProperty({ required: false }) @IsOptional() endVideoId?: string;
  @ApiProperty({ required: false }) @IsOptional() correctMessage?: string;
  @ApiProperty({ required: false }) @IsOptional() incorrectMessage?: string;
  @ApiProperty({ required: false }) @IsOptional() orderNum?: number;
  @ApiProperty({ required: false }) @IsOptional() isActive?: boolean;
}

export class CreateFinalLevelAnswerOptionDto {
  @ApiProperty() @IsString() @IsNotEmpty() questionId: string;
  @ApiProperty() @IsString() @IsNotEmpty() text: string;
  @ApiProperty({ required: false }) @IsOptional() imageId?: string;
  @ApiProperty() @IsBoolean() isCorrect: boolean;
  @ApiProperty() @IsNumber() orderNum: number;
}

export class CreateFinalLevelAnswerDetailDto {
  @ApiProperty() @IsString() @IsNotEmpty() text: string;
  @ApiProperty({ required: false }) @IsOptional() detail?: string;
  @ApiProperty() @IsBoolean() isCorrect: boolean;
  @ApiProperty() @IsNumber() orderNum: number;
}

export class UpdateFinalLevelAnswerOptionDto {
  @ApiProperty({ required: false }) @IsOptional() text?: string;
  @ApiProperty({ required: false }) @IsOptional() detail?: string;
  @ApiProperty({ required: false }) @IsOptional() isCorrect?: boolean;
  @ApiProperty({ required: false }) @IsOptional() orderNum?: number;
}

export class CreateLevelItemDto {
  @ApiProperty() @IsString() @IsNotEmpty() title: string;
  @ApiProperty({ required: false }) @IsOptional() detail?: string;
  @ApiProperty({ required: false }) @IsOptional() benefits?: string;
  @ApiProperty({ required: false }) @IsOptional() imageId?: string;
  @ApiProperty({ required: false }) @IsOptional() thumbnailId?: string;
  @ApiProperty() @IsNumber() orderNum: number;
}

export class UpdateLevelItemDto {
  @ApiProperty({ required: false }) @IsOptional() title?: string;
  @ApiProperty({ required: false }) @IsOptional() detail?: string;
  @ApiProperty({ required: false }) @IsOptional() benefits?: string;
  @ApiProperty({ required: false }) @IsOptional() imageId?: string;
  @ApiProperty({ required: false }) @IsOptional() thumbnailId?: string;
  @ApiProperty({ required: false }) @IsOptional() orderNum?: number;
}

@Injectable()
export class LevelsService {
  constructor(
    @InjectRepository(Level) private repo: Repository<Level>,
    @InjectRepository(LevelItem) private itemRepo: Repository<LevelItem>,
  ) {}

  async findByWorld(worldId: string) {
    return this.repo.find({ where: { worldId, isActive: true }, order: { levelType: 'DESC', orderNum: 'ASC' } });
  }

  async findAll(page = 1, limit = 20, worldId?: string) {
    const qb = this.repo.createQueryBuilder('l')
      .leftJoinAndSelect('l.world', 'w')
      .orderBy('w.orderNum', 'ASC').addOrderBy('l.levelType', 'DESC').addOrderBy('l.orderNum', 'ASC');
    if (worldId) qb.andWhere('l.worldId = :worldId', { worldId });
    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const l = await this.repo.findOne({ where: { id }, relations: ['world'] });
    if (!l) throw new NotFoundException('Nivel no encontrado');
    return l;
  }

  create(dto: CreateLevelDto) {
    const level = this.repo.create(dto);
    
    // Establecer isGolden automáticamente basado en levelType
    if (dto.levelType === LevelType.GOLDEN) {
      level.isGolden = true;
    } else {
      level.isGolden = false;
    }
    
    return this.repo.save(level);
  }

  async update(id: string, dto: Partial<UpdateLevelDto>) {
    await this.findOne(id);
    
    // Si se actualiza levelType, sincronizar isGolden
    const updateData: any = { ...dto };
    if (dto.levelType) {
      updateData.isGolden = dto.levelType === LevelType.GOLDEN;
    }
    
    await this.repo.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string) {
    await this.repo.update(id, { isActive: false });
    return { message: 'Nivel desactivado' };
  }

  // ============================================================
  // ITEMS DE NIVEL (CONTENIDO)
  // ============================================================

  async getItems(levelId: string) {
    return this.itemRepo.find({
      where: { levelId },
      order: { orderNum: 'ASC' },
    });
  }

  async addItem(levelId: string, dto: CreateLevelItemDto) {
    return this.itemRepo.save(this.itemRepo.create({ levelId, ...dto }));
  }

  async updateItem(itemId: string, dto: UpdateLevelItemDto) {
    await this.itemRepo.update(itemId, dto);
    return this.itemRepo.findOne({ where: { id: itemId } });
  }

  async removeItem(itemId: string) {
    await this.itemRepo.delete(itemId);
    return { message: 'Item eliminado' };
  }
}
