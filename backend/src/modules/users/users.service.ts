import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { SystemUser } from './user.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsNotEmpty, MinLength, IsEnum, IsOptional } from 'class-validator';

export class CreateUserDto {
  @ApiProperty() @IsString() @IsNotEmpty() username: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @MinLength(8) password: string;
  @ApiProperty() @IsString() @IsOptional() fullName?: string;
  @ApiProperty({ enum: ['manager', 'reporter'] }) @IsEnum(['manager', 'reporter']) role: string;
}

export class UpdateUserDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() fullName?: string;
  @ApiProperty({ required: false, enum: ['manager', 'reporter'] }) @IsOptional() @IsEnum(['manager', 'reporter']) role?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() @MinLength(8) password?: string;
  @ApiProperty({ required: false }) @IsOptional() isActive?: boolean;
}

@Injectable()
export class UsersService {
  constructor(@InjectRepository(SystemUser) private repo: Repository<SystemUser>) {}

  async findAll(page = 1, limit = 20, search?: string) {
    const qb = this.repo.createQueryBuilder('u')
      .select(['u.id', 'u.username', 'u.email', 'u.fullName', 'u.role', 'u.isActive', 'u.lastLogin', 'u.createdAt'])
      .orderBy('u.createdAt', 'DESC');

    if (search) qb.where('u.username ILIKE :s OR u.email ILIKE :s OR u.fullName ILIKE :s', { s: `%${search}%` });

    const [data, total] = await qb.skip((page - 1) * limit).take(limit).getManyAndCount();
    return { data, total, page, limit, pages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    const { password, ...rest } = user;
    return rest;
  }

  async create(dto: CreateUserDto) {
    const exists = await this.repo.findOne({ where: [{ username: dto.username }, { email: dto.email }] });
    if (exists) throw new ConflictException('Username o email ya existe');
    const hash = await bcrypt.hash(dto.password, 10);
    const user = this.repo.create({ ...dto, password: hash });
    const saved = await this.repo.save(user);
    const { password, ...rest } = saved;
    return rest;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.repo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (dto.password) dto.password = await bcrypt.hash(dto.password, 10);
    Object.assign(user, dto);
    const saved = await this.repo.save(user);
    const { password, ...rest } = saved;
    return rest;
  }

  async remove(id: string) {
    await this.repo.update(id, { isActive: false });
    return { message: 'Usuario desactivado' };
  }
}
