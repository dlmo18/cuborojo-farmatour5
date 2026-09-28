import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateHowToPlayDto {
  @ApiProperty({ type: String, description: 'Contenido HTML/texto enriquecido' })
  @IsString()
  @IsNotEmpty()
  content: string;
}
