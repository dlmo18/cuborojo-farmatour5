import { Controller, Get, Put, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { HowToPlayService } from './how-to-play.service';
import { ManagerGuard } from '../auth/guards';
import { UpdateHowToPlayDto } from './dto/update-how-to-play.dto';

@ApiTags('how-to-play')
@Controller('how-to-play')
export class HowToPlayController {
  constructor(private readonly service: HowToPlayService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener instrucciones de cómo jugar' })
  async get() {
    return this.service.get();
  }

  @Put()
  @ApiBearerAuth('access-token')
  @UseGuards(ManagerGuard)
  @ApiOperation({ summary: 'Actualizar instrucciones de cómo jugar' })
  async update(@Body() dto: UpdateHowToPlayDto) {
    return this.service.update(dto);
  }
}
