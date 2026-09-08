import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { SystemUser } from '../users/user.entity';
import { Participant } from '../participants/participant.entity';
import { ActivityLog } from '../progress/activity-log.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(SystemUser) private usersRepo: Repository<SystemUser>,
    @InjectRepository(Participant) private participantsRepo: Repository<Participant>,
    @InjectRepository(ActivityLog) private logsRepo: Repository<ActivityLog>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async loginAdmin(username: string, password: string) {
    const user = await this.usersRepo.findOne({
      where: [{ username }, { email: username }],
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Credenciales inválidas');
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Credenciales inválidas');

    await this.usersRepo.update(user.id, { lastLogin: new Date() });

    const payload = { sub: user.id, username: user.username, role: user.role, type: 'admin' };
    return {
      access_token: this.jwtService.sign(payload),
      user: { id: user.id, username: user.username, fullName: user.fullName, role: user.role },
    };
  }

  async loginParticipant(dni: string, ip?: string, userAgent?: string) {
    const participant = await this.participantsRepo.findOne({
      where: { dni, isActive: true },
      relations: ['group'],
    });
    if (!participant) {
      throw new UnauthorizedException('DNI no encontrado o cuenta inactiva');
    }

    await this.participantsRepo.update(participant.id, { lastLogin: new Date() });

    // Registrar actividad de login
    await this.logsRepo.save(
      this.logsRepo.create({
        participantId: participant.id,
        action: 'login',
        ipAddress: ip,
        userAgent,
      }),
    );

    const payload = {
      sub: participant.id,
      dni: participant.dni,
      fullName: participant.fullName,
      type: 'participant',
    };
    const secret = this.config.get('JWT_PARTICIPANT_SECRET');
    const expiresIn = this.config.get('JWT_PARTICIPANT_EXPIRES_IN', '24h');

    return {
      access_token: this.jwtService.sign(payload, { secret, expiresIn }),
      participant: {
        id: participant.id,
        fullName: participant.fullName,
        dni: participant.dni,
        totalStars: participant.totalStars,
        group: participant.group ? { id: participant.group.id, name: participant.group.name } : null,
      },
    };
  }
}
