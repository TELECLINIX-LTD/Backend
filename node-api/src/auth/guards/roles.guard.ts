import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from 'src/common/enums/roles.enum';
import { ROLES_KEY } from 'src/decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    console.log('requiredRoles', requiredRoles);
    const { user } = context.switchToHttp().getRequest();

    console.log('User:', user);
    console.log('Required Roles:', requiredRoles);

    if (!user || !user.role) {
      console.warn('Access denied: User role is missing or invalid');
      return false;
    }

    const userRole = user.role.toLowerCase();
    const hasRole = requiredRoles.some(
      (role) => role.toLowerCase() === userRole,
    );

    console.log('Has required role:', hasRole);

    return hasRole;
  }
}
