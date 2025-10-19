// permissions.module.ts
import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PermissionsService } from 'src/common/policies/permissions.service';
import { Permission } from 'src/common/typeorm/entities/permission.entity';
import { UserPermission } from 'src/common/typeorm/entities/user-permission.entity';

@Global() // 👈 Makes this module GLOBAL
@Module({
    imports: [TypeOrmModule.forFeature([Permission, UserPermission])],
    providers: [PermissionsService],
    exports: [TypeOrmModule, PermissionsService],
})
export class PermissionsModule { }
