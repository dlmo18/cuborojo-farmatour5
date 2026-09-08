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

class UpdateSingleConfigDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  key: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  value: string;
}

@ApiTags('config')
@Controller('config')
export class ConfigController {
  constructor(private readonly service: ConfigService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener todas las configuraciones del sistema (públicas)' })
  findAll() { return this.service.findAll(); }

  @Put()
  @ApiBearerAuth('access-token')
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Actualizar una o más configuraciones del sistema' })
  update(@Body() dto: UpdateSingleConfigDto | UpdateConfigDto, @Req() req: any) {
    // Si es un objeto con key/value, convertir a array
    if ('configs' in dto) {
      return this.service.setMany(dto.configs, req.user.id);
    }
    // Si es un objeto single con key/value
    return this.service.set(dto.key, dto.value, req.user.id);
  }
}
