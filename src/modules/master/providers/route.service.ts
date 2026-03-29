import { Injectable } from '@nestjs/common';
import { IUserPermissionDto } from 'src/common/dto/user-permission.dto';
import { lmsRoutes } from '../routes/lms.routes';
import { welcomeRoutes } from '../routes/welcome.routes';
import { quizRoutes } from '../routes/quiz.routes';
import { adminRoutes } from '../routes/admin.routes';
import { uiRoutes } from '../routes/ui.routes';
import { userRoutes } from '../routes/user.routes';
import { smeRoutes } from '../routes/sme.routes';
import { footerRoutes } from '../routes/footer.routes';

@Injectable()
export class RouteService {
  private normalizeRole(role?: string): string {
    return (role || '').trim();
  }

  private isRouteAllowed(routeRoles: string[] | undefined, userRole?: string): boolean {
    const normalizedUserRole = this.normalizeRole(userRole);
    const normalizedRoles = (routeRoles || []).map((role) => this.normalizeRole(role));
    if (normalizedRoles.includes('All')) return true;
    if (!normalizedUserRole) return false;
    return normalizedRoles.includes(normalizedUserRole);
  }

  private filterRoutesByRole(routes: any[], userRole?: string): any[] {
    return (routes || [])
      .map((route) => {
        const filteredSubmenu = this.filterRoutesByRole(route?.submenu || [], userRole);
        const isCurrentRouteAllowed = this.isRouteAllowed(route?.role, userRole);
        if (!isCurrentRouteAllowed && filteredSubmenu.length === 0) return null;
        return { ...route, submenu: filteredSubmenu };
      })
      .filter(Boolean);
  }

  /**
   * Get all routes for a user, filtered by role and permissions.
   */
  /**
   * userPermissions: strictly IUserPermissionDto[]
   */
  getRoutesConfig(userRole?: string, userPermissions: IUserPermissionDto[] = []): any[] {
    // let routes: any[] = [
    //   ...welcomeRoutes,
    //   ...quizRoutes,
    //   ...adminRoutes,
    //   ...uiRoutes,
    //   ...userRoutes,
    // ];

    let routes: any[] = [
    ];

    console.log("userPermissions", userPermissions);
    const permissionNames = userPermissions.map((p) => p.permissionName);
    if (permissionNames.includes('LMS Manager')) {
      routes = [...routes, ...lmsRoutes, ...quizRoutes, ...smeRoutes];
    }
    routes = [...routes,
      ...adminRoutes,
      ...uiRoutes,
      ...userRoutes,
      ...welcomeRoutes,
      ...footerRoutes
    ];
    // Add more modular route groups here as needed, based on permissions
    return this.filterRoutesByRole(routes, userRole);
    //return routes;
  }
}
