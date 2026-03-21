export interface IUserPermissionDto {
  id: number;
  userId: number;
  permissionId: number;
  resourceType?: string;
  resourceId?: number;
  permissionName: string;
}
