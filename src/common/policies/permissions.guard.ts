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
        let hasPermission: boolean = null;
        if (resourceType == UserPermissionTitleEnum.Question) {
            if (payload.subjectId) {
                resourceType = UserPermissionTitleEnum.Subject;
                resourceId = payload.subjectId;
                hasPermission = await this.permissionService.findOneByUser(user.id, permission, resourceType, resourceId);
            }
            if (!hasPermission && (payload.topicIds || payload.topicIds > 0)) {
                resourceType = UserPermissionTitleEnum.Topic;
                resourceId = payload.topicIds;
                hasPermission = await this.permissionService.findByUserTopics(user.id, permission, resourceType, resourceId);
            }
        } else {
            resourceId = +request.params.id || +request.body.resourceId || null;
            hasPermission = await this.permissionService.findOneByUser(user.id, permission, resourceType, resourceId);
        }
        if (!hasPermission) {
            throw new AppCustomException(
                HttpStatus.FORBIDDEN,
                `You do not have sufficient permission to request this action. Please contact admin.`,
            );
        }

        return true;
    }
}
