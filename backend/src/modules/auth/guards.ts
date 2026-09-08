import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

// Guard para administradores (manager/reporter)
@Injectable()
export class AdminGuard extends AuthGuard('jwt-admin') {}

// Guard solo para managers (control total)
@Injectable()
export class ManagerGuard extends AuthGuard('jwt-admin') implements CanActivate {
  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    await super.canActivate(ctx);
    const req = ctx.switchToHttp().getRequest();
    if (req.user?.role !== 'manager') {
      throw new ForbiddenException('Se requiere rol manager');
    }
    return true;
  }
}

// Guard para participantes
@Injectable()
export class ParticipantGuard extends AuthGuard('jwt-participant') {}
