import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserPermissionService } from './providers/user-permission.service';
import { UserPermissionController } from './user-permission.controller';
import { Permission } from 'src/common/typeorm/entities/permission.entity';
import { UserPermission } from 'src/common/typeorm/entities/user-permission.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission, UserPermission]),
  ],
  providers: [UserPermissionService],
  controllers: [UserPermissionController],
  exports: [UserPermissionService],
})
export class UserPermissionModule { }
