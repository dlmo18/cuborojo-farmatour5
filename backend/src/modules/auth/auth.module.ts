import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { JwtParticipantStrategy } from './jwt-participant.strategy';
import { SystemUser } from '../users/user.entity';
import { Participant } from '../participants/participant.entity';
import { ActivityLog } from '../progress/activity-log.entity';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        secret: cfg.get('JWT_SECRET'),
        signOptions: { expiresIn: cfg.get('JWT_EXPIRES_IN', '8h') },
      }),
    }),
    TypeOrmModule.forFeature([SystemUser, Participant, ActivityLog]),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, JwtParticipantStrategy],
  exports: [AuthService],
})
export class AuthModule {}
