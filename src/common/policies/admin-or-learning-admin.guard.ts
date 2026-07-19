import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserRoleEnum } from 'src/core/users/enums/user-roles.enum';
import { UserPermissionEnum } from './user-permission.enum';
import { PermissionsService } from './permissions.service';

/**
 * Gate for reviewing permission requests: Admin role, or anyone holding the
 * Role:LearningAdmin permission (global grant — no resourceType/resourceId scoping).
 */
@Injectable()
export class AdminOrLearningAdminGuard implements CanActivate {
  constructor(private readonly permissionService: PermissionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return false;
    if (user.role === UserRoleEnum.ADMIN) return true;

    return this.permissionService.hasGlobalPermission(
      user.id,
      UserPermissionEnum.LearningAdmin,
    );
  }
}
