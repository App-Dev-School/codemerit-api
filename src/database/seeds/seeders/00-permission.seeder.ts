import { DataSource } from 'typeorm';
import { Permission } from 'src/common/typeorm/entities/permission.entity';
import { UserPermissionEnum } from 'src/common/policies/user-permission.enum';

const PERMISSION_DESCRIPTIONS: Record<UserPermissionEnum, string> = {
  [UserPermissionEnum.TopicGet]: 'View topics',
  [UserPermissionEnum.TopicCreate]: 'Create topics',
  [UserPermissionEnum.QuestionAuthorCreate]: 'Create questions as an author',
  [UserPermissionEnum.QuestionAuthorUpdate]: 'Update own questions',
  [UserPermissionEnum.QuestionAuthorDelete]: 'Delete own questions',
  [UserPermissionEnum.LmsManager]: 'Full LMS management access',
  [UserPermissionEnum.SubjectTrackGet]: 'View all subject tracks',
  [UserPermissionEnum.SubjectTrackCreate]: 'Create subject tracks',
  [UserPermissionEnum.SubjectTrackUpdate]: 'Update subject tracks and manage topic links',
  [UserPermissionEnum.SubjectTrackDelete]: 'Delete subject tracks',
  [UserPermissionEnum.CertificationTrackGet]: 'View all certification tracks',
  [UserPermissionEnum.CertificationTrackCreate]: 'Create certification tracks',
  [UserPermissionEnum.CertificationTrackUpdate]: 'Update certification tracks and manage subject track links',
  [UserPermissionEnum.CertificationTrackDelete]: 'Delete certification tracks',
};

export async function seedPermissions(dataSource: DataSource): Promise<Permission[]> {
  const repo = dataSource.getRepository(Permission);

  for (const [key, value] of Object.entries(UserPermissionEnum)) {
    const exists = await repo.findOne({ where: { permission: value } });
    if (!exists) {
      await repo.save(repo.create({
        permission: value,
        description: PERMISSION_DESCRIPTIONS[value as UserPermissionEnum] ?? key,
      }));
    }
  }

  const all = await repo.find({ order: { id: 'ASC' } });
  console.log(`  ✔ Permissions: ${all.length} records`);
  return all;
}
