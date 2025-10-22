import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { UserPermission } from 'src/common/typeorm/entities/user-permission.entity';
import { GrantPermissionDto } from '../dto/grant-permission.dto';
import { AppCustomException } from 'src/common/exceptions/app-custom-exception.filter';
import { Permission } from 'src/common/typeorm/entities/permission.entity';

@Injectable()
export class UserPermissionService {
  constructor(
    @InjectRepository(UserPermission)
    private userPermissionRepo: Repository<UserPermission>,
    @InjectRepository(Permission)
    private permissionRepo: Repository<Permission>,
  ) { }

  async grantPermission(dto: GrantPermissionDto) {
    const { userId, resourceType, resourceId } = dto;
    const permissionIds: number[] = dto.permissionIds;
    const existingPermission = await this.permissionRepo.find({
      where: {
        id: In([permissionIds]),
      },
    });

    if (!existingPermission || existingPermission.length !== permissionIds.length) {
      throw new AppCustomException(
        HttpStatus.NOT_FOUND,
        `Could not find the permission.`
      );
    }

    const existing = await this.userPermissionRepo.findOne({
      where: {
        userId,
        permissionId: In([permissionIds]),
        resourceType,
        resourceId,
      },
    });

    if (existing) {
      throw new AppCustomException(
        HttpStatus.NOT_FOUND,
        `Already exist this permission.`
      );
    }
    let permission: any[] = [];
    for (const permissionId of permissionIds) {
      const newEntry = this.userPermissionRepo.create({
        userId,
        permissionId,
        resourceType,
        resourceId,
      });
      permission.push(newEntry);
    }

    const result = await this.userPermissionRepo.save(permission);

    return result;


  }


  async revokePermission(id: number) {

    const perm = await this.userPermissionRepo.findOne({ where: { id } });
    if (!perm) {
      throw new AppCustomException(
        HttpStatus.NOT_FOUND,
        `Could not deleted due to not find this permission with id ${id}.`
      );
    }

    const deleted = await this.userPermissionRepo.delete({ id });
    if (deleted.affected && deleted.affected > 0) {
      return 'Successfully Deleted';
    }
    return null;
  }

  async masterPermissions() {
    return this.permissionRepo.find();
  }

  async findUserPermissionList(userId: number) {
    // return this.userPermissionRepo.find({
    //   where: { userId }
    // });
    return this.userPermissionRepo
      .createQueryBuilder('userPermission')
      .leftJoin('userPermission.permission', 'permission')
      .where('userPermission.userId = :userId', { userId })
      .select([
        'userPermission.id as id',
        'userPermission.userId as userId',
        'userPermission.permissionId as permissionId',
        'userPermission.resourceType as resourceType',
        'userPermission.resourceId as resourceId',
        'permission.permission AS permissionName',
      ])
      .getRawMany();
  }

  async findUsersByPermissionId(id: number) {
    const result = await this.userPermissionRepo
      .createQueryBuilder('userPermission')
      .leftJoin('userPermission.user', 'user')
      .leftJoin('userPermission.permission', 'permission')
      .where('userPermission.id = :id', { id })
      .select([
        'userPermission.id AS id',
        'user.id AS userId',
        'user.firstName AS firstName',
        'user.lastName AS lastName',
        'permission.permission AS permission',
        'userPermission.resourceType AS resourceType',
        'userPermission.resourceId AS resourceId',

      ])
      .getRawOne();

    return result;
  }


}
