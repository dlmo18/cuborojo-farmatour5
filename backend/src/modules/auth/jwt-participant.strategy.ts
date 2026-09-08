import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtParticipantStrategy extends PassportStrategy(Strategy, 'jwt-participant') {
  constructor(cfg: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: cfg.get('JWT_PARTICIPANT_SECRET'),
    });
  }

  validate(payload: any) {
    return { id: payload.sub, dni: payload.dni, fullName: payload.fullName, type: payload.type };
  }
}
