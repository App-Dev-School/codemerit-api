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
        `Could not find the permission.`,
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
        `Already exist this permission.`,
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

    // Fetch user details
    const user = await this.userRepo.findOne({
      where: { id: userId },
    });

    // Fetch all subjects and topics
    const [subjects, topics] = await Promise.all([
      this.subjectRepo.find(),
      this.topicRepo.find(),
    ]);

    // Build enriched response (same format as getAllUserPermissions)
    const result = savedPermissions.map((up) => {
      let resourceName = '';

      if (up.resourceType === 'Subject' && up.resourceId) {
        const subject = subjects.find((s) => s.id === up.resourceId);
        resourceName = subject?.title || '';
      } else if (up.resourceType === 'Topic' && up.resourceId) {
        const topic = topics.find((t) => t.id === up.resourceId);
        resourceName = topic?.title || '';
      }

      // Get permission name
      const perm = existingPermission.find((p) => p.id === up.permissionId);

      return {
        id: up.id,
        permissionId: up.permissionId,
        permissionName: perm?.permission || null,
        resourceType: up.resourceType,
        resourceId: up.resourceId,
        resourceName,
        user: user
          ? {
              id: user.id,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              role: user.role,
              designation: user.designation,
              createdAt: user.createdAt,
            }
          : null,
      };
    });

    return result;
  }

  async revokePermission(id: number) {
    const perm = await this.userPermissionRepo.findOne({ where: { id } });
    if (!perm) {
      throw new AppCustomException(
        HttpStatus.NOT_FOUND,
        `Could not deleted due to not find this permission with id ${id}.`,
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

    // Fetch all subjects and topics
    const [subjects, topics] = await Promise.all([
      this.subjectRepo.find(),
      this.topicRepo.find(),
    ]);

    // Map user permissions with additional details
    const result = userPermissions.map((up) => {
      let resourceName = '';

      if (up.resourceType === 'Subject' && up.resourceId) {
        const subject = subjects.find((s) => s.id === up.resourceId);
        resourceName = subject?.title || '';
      } else if (up.resourceType === 'Topic' && up.resourceId) {
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

    return result;
  }
}
