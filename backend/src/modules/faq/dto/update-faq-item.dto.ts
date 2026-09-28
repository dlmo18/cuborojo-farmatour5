import { IsString, IsNumber, Min, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFaqItemDto {
  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiProperty({ type: String, required: false })
  @IsString()
  @IsOptional()
  detail?: string;

  @ApiProperty({ type: Number, required: false })
  @IsNumber()
  @Min(1)
  @IsOptional()
  orderNum?: number;
}
