

export interface IPermission {
  id: number;
  permission: string;
  description: string;
  isVisible: boolean;
  isRequestable: boolean;
  createdBy: number;
  createdAt: Date;
}
