import { Controller, Post, Body, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { Request } from 'express';

class AdminLoginDto {
  @ApiProperty({ example: 'admin' })
  @IsString() @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'Admin1234!' })
  @IsString() @IsNotEmpty() @MinLength(6)
  password: string;
}

class ParticipantLoginDto {
  @ApiProperty({ example: '12345678' })
  @IsString() @IsNotEmpty()
  dni: string;
}

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/login')
  @ApiOperation({ summary: 'Login de administrador/reporter' })
  @ApiResponse({ status: 200, description: 'Token JWT retornado' })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  loginAdmin(@Body() dto: AdminLoginDto) {
    return this.authService.loginAdmin(dto.username, dto.password);
  }

  @Post('participant/login')
  @ApiOperation({ summary: 'Login de participante por DNI' })
  @ApiResponse({ status: 200, description: 'Token JWT retornado' })
  @ApiResponse({ status: 401, description: 'DNI no encontrado' })
  loginParticipant(@Body() dto: ParticipantLoginDto, @Req() req: Request) {
    const ip = req.ip;
    const ua = req.headers['user-agent'];
    return this.authService.loginParticipant(dto.dni, ip, ua);
  }
}
