import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { parse } from 'csv-parse/sync';
import * as XLSX from 'xlsx';
import { Participant } from './participant.entity';
import { IsString, IsNotEmpty, IsEmail, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateParticipantDto {
  @ApiProperty() @IsString() @IsNotEmpty() dni: string;
  @ApiProperty() @IsString() @IsNotEmpty() fullName: string;
  @ApiProperty({ required: false }) @IsOptional() @IsEmail() email?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsUUID() groupId?: string;
}

export class UpdateParticipantDto {
  @ApiProperty({ required: false }) @IsOptional() fullName?: string;
  @ApiProperty({ required: false }) @IsOptional() email?: string;
  @ApiProperty({ required: false }) @IsOptional() groupId?: string;
  @ApiProperty({ required: false }) @IsOptional() isActive?: boolean;
}

@Injectable()
export class ParticipantsService {
  constructor(@InjectRepository(Participant) private repo: Repository<Participant>) {}

  async findAll(page = 1, limit = 20, search?: string, groupId?: string) {
    const qb = this.repo.createQueryBuilder('p')
      .leftJoinAndSelect('p.group', 'g')
      .orderBy('p.createdAt', 'DESC');

    if (search) qb.andWhere('p.fullName ILIKE :s OR p.dni ILIKE :s OR p.email ILIKE :s', { s: `%${search}%` });
    if (groupId) qb.andWhere('p.groupId = :groupId', { groupId });

    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const p = await this.repo.findOne({ where: { id }, relations: ['group'] });
    if (!p) throw new NotFoundException('Participante no encontrado');
    return p;
  }

  async create(dto: CreateParticipantDto) {
    const exists = await this.repo.findOne({ where: { dni: dto.dni } });
    if (exists) throw new ConflictException(`DNI ${dto.dni} ya registrado`);
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateParticipantDto) {
    const p = await this.repo.findOne({ where: { id } });
    if (!p) throw new NotFoundException('Participante no encontrado');
    Object.assign(p, dto);
    return this.repo.save(p);
  }

  async remove(id: string) {
    await this.repo.update(id, { isActive: false });
    return { message: 'Participante desactivado' };
  }

  async importFromBuffer(buffer: Buffer, mimetype: string): Promise<{ imported: number; errors: string[] }> {
    let rows: any[] = [];
    const errors: string[] = [];

    if (mimetype === 'text/csv' || mimetype === 'application/csv') {
      rows = parse(buffer, { columns: true, skip_empty_lines: true, trim: true });
    } else {
      const wb = XLSX.read(buffer);
      const ws = wb.Sheets[wb.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(ws, { defval: '' });
    }

    let imported = 0;
    for (const row of rows) {
      const dni = String(row.dni || row.DNI || '').trim();
      const fullName = String(row.nombre || row.full_name || row.NOMBRE || '').trim();
      if (!dni || !fullName) {
        errors.push(`Fila sin DNI o nombre: ${JSON.stringify(row)}`);
        continue;
      }
      try {
        await this.create({ dni, fullName, email: row.email || row.EMAIL, groupId: row.group_id || undefined });
        imported++;
      } catch (e) {
        errors.push(`${dni}: ${e.message}`);
      }
    }
    return { imported, errors };
  }
}
