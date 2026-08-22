import { Controller, Get, Put, Body, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ConfigService } from './config.service';
import { ManagerGuard } from '../auth/guards';
import { IsString, IsNotEmpty, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

class UpdateConfigDto {
  @ApiProperty({ type: [Object] })
  @IsArray()
  configs: { key: string; value: string }[];
}

@ApiTags('config')
@ApiBearerAuth('access-token')
@Controller('config')
export class ConfigController {
  constructor(private readonly service: ConfigService) {}

  @Get()
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Obtener todas las configuraciones del sistema' })
  findAll() { return this.service.findAll(); }

  @Put()
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Actualizar configuraciones del sistema' })
  update(@Body() dto: UpdateConfigDto, @Req() req: any) {
    return this.service.setMany(dto.configs, req.user.id);
  }
}
