import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { REQUIRE_PERMISSION_KEY } from './require-permission.decorator';
import { Permission } from '../typeorm/entities/permission.entity';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        @InjectRepository(Permission)
        private permissionRepo: Repository<Permission>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const { permissionId, resourceType } = this.reflector.getAllAndOverride(REQUIRE_PERMISSION_KEY, [
            context.getHandler(),
            context.getClass(),
        ]) || {};

        if (!permissionId || !resourceType) {
            return true; // No permission required
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // You might get this from a param, body, or query
        const resourceId = +request.params.id || +request.body.resourceId || null;
        console.log('hasPermission', { user, permissionId, resourceType, resourceId });

        const hasPermission = await this.permissionRepo.findOne({
            where: {
                user: { id: user.id },
                permissionId,
                resourceType: resourceType,
                resourceId: resourceId,
            },
        });

        if (!hasPermission) {
            throw new ForbiddenException(`You do not have permission: ${permissionId} on ${resourceType} ${resourceId}`);
        }

        return true;
    }
}
