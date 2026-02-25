import { HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Not, Repository } from 'typeorm';
import { UserPermission } from 'src/common/typeorm/entities/user-permission.entity';
import { GrantPermissionDto } from '../dto/grant-permission.dto';
import { AppCustomException } from 'src/common/exceptions/app-custom-exception.filter';
import { Permission } from 'src/common/typeorm/entities/permission.entity';
import { Subject } from 'src/common/typeorm/entities/subject.entity';
import { Topic } from 'src/common/typeorm/entities/topic.entity';
import { User } from 'src/common/typeorm/entities/user.entity';

@Injectable()
export class UserPermissionService {
  constructor(
    @InjectRepository(UserPermission)
    private userPermissionRepo: Repository<UserPermission>,
    @InjectRepository(Permission)
    private permissionRepo: Repository<Permission>,
    @InjectRepository(Subject)
    private subjectRepo: Repository<Subject>,
    @InjectRepository(Topic)
    private topicRepo: Repository<Topic>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async grantPermission(dto: GrantPermissionDto) {
    const { userId, resourceType, resourceId } = dto;
    const permissionIds: number[] = dto.permissionIds;
    const existingPermission = await this.permissionRepo.find({
      where: {
        id: In([permissionIds]),
      },
    });

    if (
      !existingPermission ||
      existingPermission.length !== permissionIds.length
    ) {
      throw new AppCustomException(
        HttpStatus.NOT_FOUND,
        `Could not find the Permission.`,
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
        HttpStatus.CONFLICT,
        `Permission already granted to this user .`,
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

    const savedPermissions = await this.userPermissionRepo.save(permission);
    const permissionIdsToLoad = savedPermissions.map((item) => item.id);
    const permissionRows = await this.userPermissionRepo.find({
      where: { id: In(permissionIdsToLoad) },
      relations: ['user', 'permission'],
    });

    return this.buildPermissionResponse(permissionRows);
  }

  async revokePermission(id: number) {
    const perm = await this.userPermissionRepo.findOne({ where: { id } });
    if (!perm) {
      throw new AppCustomException(
        HttpStatus.NOT_FOUND,
        `Permission with ID ${id} not found. Cannot revoke non-existent permission.`,
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

  async getAllUserPermissions() {
    const userPermissions = await this.userPermissionRepo.find({
      relations: ['user', 'permission'],
    });

    return this.buildPermissionResponse(userPermissions);
  }

  private async buildPermissionResponse(userPermissions: UserPermission[]) {
    const [subjects, topics] = await Promise.all([
      this.subjectRepo.find(),
      this.topicRepo.find(),
    ]);

    return userPermissions.map((up) => {
      let resourceName = '';
      const normalizedResourceType = String(
        up.resourceType || '',
      ).toLowerCase();

      if (normalizedResourceType === 'subject' && up.resourceId) {
        const subject = subjects.find((s) => s.id === up.resourceId);
        resourceName = subject?.title || '';
      } else if (normalizedResourceType === 'topic' && up.resourceId) {
        const topic = topics.find((t) => t.id === up.resourceId);
        resourceName = topic?.title || '';
      }

      return {
        id: up.id,
        permissionId: up.permissionId,
        permissionName: up.permission?.permission || null,
        resourceType: up.resourceType,
        resourceId: up.resourceId,
        resourceName,
        user: up.user
          ? {
              id: up.user.id,
              firstName: up.user.firstName,
              lastName: up.user.lastName,
              email: up.user.email,
              role: up.user.role,
              designation: up.user.designation,
              createdAt: up.user.createdAt,
            }
          : null,
      };
    });
  }
}
