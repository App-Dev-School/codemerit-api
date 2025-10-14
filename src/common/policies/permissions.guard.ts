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
import { UserPermission } from '../typeorm/entities/user-permission.entity';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        @InjectRepository(Permission)
        private permissionRepo: Repository<Permission>,
        @InjectRepository(UserPermission)
        private userPermissionRepo: Repository<UserPermission>,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const { permission, resourceType } = this.reflector.getAllAndOverride(REQUIRE_PERMISSION_KEY, [
            context.getHandler(),
            context.getClass(),
        ]) || {};

        if (!permission || !resourceType) {
            return true; // No permission required
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        // You might get this from a param, body, or query
        const resourceId = +request.params.id || +request.body.resourceId || null;
        console.log('hasPermission', { user, permission, resourceType, resourceId });

        const hasPermission = await this.userPermissionRepo.findOne({
            where: {
                userId: user.id,
                permission: {
                    permission: permission,
                },
                resourceType,
                resourceId,
            },
            relations: ['permission'],
        });


        if (!hasPermission) {
            throw new ForbiddenException(`You do not have permission: ${permission} on ${resourceType} ${resourceId}`);
        }

        return true;
    }
}
