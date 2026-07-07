import {
    Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Equal, In, IsNull, Or, Repository } from 'typeorm';
import { Permission } from '../typeorm/entities/permission.entity';
import { UserPermission } from '../typeorm/entities/user-permission.entity';
import { UserPermissionTitleEnum } from './user-permission.enum';

@Injectable()
export class PermissionsService {
    constructor(
        @InjectRepository(Permission)
        private permissionRepo: Repository<Permission>,
        @InjectRepository(UserPermission)
        private userPermissionRepo: Repository<UserPermission>,
    ) { }

    async findOneByUser(userId: number, permission: string, resourceType: UserPermissionTitleEnum, resourceId: number) {
        // Match exact resourceId OR a global grant (resourceId IS NULL) for the same permission+type
        const result = await this.userPermissionRepo.findOne({
            where: {
                userId,
                permission: { permission },
                resourceType,
                resourceId: resourceId !== null ? Or(Equal(resourceId), IsNull()) : IsNull(),
            },
            relations: ['permission'],
        });
        return Boolean(result);
    }

    //add utility
    //private async ensureLmsAccess(userId: number, permissionId) {

    async findByUserTopics(userId: number, permission: string, resourceType: UserPermissionTitleEnum,
        resourceId: number | number[]) {
        const whereCondition: any = {
            userId: userId,
            permission: {
                permission: permission,
            },
            resourceType,
            resourceId: Array.isArray(resourceId) ? In(resourceId) : resourceId,
        };
        let flag: boolean = false;

        const query = await this.userPermissionRepo.find({
            where: whereCondition,
            relations: ['permission'],
        });
        //console.log(`length ${query.length} == ${resourceId.toString()}`);

        if (Array.isArray(resourceId) && resourceId.length > 0 && query.length == resourceId.length) {
            flag = true;
        } else if (!Array.isArray(resourceId) && query.length > 0) {
            return flag = true;
        }
        return flag;
    }
}
