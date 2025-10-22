import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
    HttpStatus,
} from '@nestjs/common';
import { REQUIRE_PERMISSION_KEY } from './require-permission.decorator';
import { Reflector } from '@nestjs/core';
import { UserPermissionTitleEnum } from './user-permission.enum';
import { PermissionsService } from './permissions.service';
import { AppCustomException } from '../exceptions/app-custom-exception.filter';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private reflector: Reflector,
        private readonly permissionService: PermissionsService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        let { permission, resourceType } = this.reflector.getAllAndOverride(REQUIRE_PERMISSION_KEY, [
            context.getHandler(),
            context.getClass(),
        ]) || {};

        if (!permission || !resourceType) {
            return true; // No permission required
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const payload = request.body;
        let resourceId: any = null;
        console.log('request permission', permission, resourceType);
        // You might get this from a param, body, or query
        let hasPermission: boolean = null;
        if (resourceType == UserPermissionTitleEnum.Question) {
            if (payload.subjectId) {
                resourceType = UserPermissionTitleEnum.Subject;
                resourceId = payload.subjectId;
                hasPermission = await this.permissionService.findOneByUser(user.id, permission, resourceType, resourceId);
                console.log('has permission subject', hasPermission);

            }
            if (!hasPermission && (payload.topicIds || payload.topicIds > 0)) {
                resourceType = UserPermissionTitleEnum.Topic;
                resourceId = payload.topicIds;
                hasPermission = await this.permissionService.findByUserTopics(user.id, permission, resourceType, resourceId);
                console.log('has permission topic', hasPermission);
            }
        } else {
            resourceId = +request.params.id || +request.body.resourceId || null;
            hasPermission = await this.permissionService.findOneByUser(user.id, permission, resourceType, resourceId);
        }
        console.log('hasPermission', { user, permission, resourceType, resourceId });



        if (!hasPermission) {
            throw new AppCustomException(
                HttpStatus.FORBIDDEN,
                `You do not have sufficient permissions to take this action. Request grant for ${permission}. Please contact admin.`,
            );
        }

        return true;
    }
}
