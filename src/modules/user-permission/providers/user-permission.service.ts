import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
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
    const { userId, permissionId, resourceType, resourceId } = dto;


    const existing = await this.userPermissionRepo.findOne({
      where: {
        userId,
        permissionId,
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

    const newEntry = this.userPermissionRepo.create({
      userId,
      permissionId,
      resourceType,
      resourceId,
    });

    return this.userPermissionRepo.save(newEntry);

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
    return false;
  }

  async masterPermissions() {
    return this.permissionRepo.find();
  }

  async findUserPermissionList(userId: number) {
    return this.userPermissionRepo.find({
      where: { userId }
    });
  }

}
