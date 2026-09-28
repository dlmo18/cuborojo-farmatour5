import { IsString, IsEmail, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ type: String })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty({ type: String })
  @IsString()
  @IsNotEmpty()
  message: string;
}
