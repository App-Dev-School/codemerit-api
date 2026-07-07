import { DataSource } from 'typeorm';
import { Permission } from 'src/common/typeorm/entities/permission.entity';
import { UserPermissionEnum } from 'src/common/policies/user-permission.enum';

const PERMISSION_GROUP = 'LMS Manager';
const SUBJECT_TRACK_GROUP = 'Subject Track Manager';
const CERTIFICATION_TRACK_GROUP = 'Certification Manager';
const QUESTION_AUTHOR_GROUP = 'Question Author';
const TOPIC_ACCESS_GROUP = 'Topic Access';

type PermissionMeta = { description: string; group: string };

const PERMISSION_META: Record<UserPermissionEnum, PermissionMeta> = {
  [UserPermissionEnum.TopicGet]:                  { description: 'View topics',                                              group: TOPIC_ACCESS_GROUP },
  [UserPermissionEnum.TopicCreate]:               { description: 'Create topics',                                            group: TOPIC_ACCESS_GROUP },
  [UserPermissionEnum.QuestionAuthorCreate]:      { description: 'Create questions as an author',                            group: QUESTION_AUTHOR_GROUP },
  [UserPermissionEnum.QuestionAuthorUpdate]:      { description: 'Update own questions',                                     group: QUESTION_AUTHOR_GROUP },
  [UserPermissionEnum.QuestionAuthorDelete]:      { description: 'Delete own questions',                                     group: QUESTION_AUTHOR_GROUP },
  [UserPermissionEnum.LmsManager]:               { description: 'Full LMS management access',                               group: PERMISSION_GROUP },
  [UserPermissionEnum.SubjectTrackGet]:          { description: 'View all subject tracks',                                  group: SUBJECT_TRACK_GROUP },
  [UserPermissionEnum.SubjectTrackCreate]:       { description: 'Create subject tracks',                                    group: SUBJECT_TRACK_GROUP },
  [UserPermissionEnum.SubjectTrackUpdate]:       { description: 'Update subject tracks and manage topic links',             group: SUBJECT_TRACK_GROUP },
  [UserPermissionEnum.SubjectTrackDelete]:       { description: 'Delete subject tracks',                                    group: SUBJECT_TRACK_GROUP },
  [UserPermissionEnum.CertificationTrackGet]:    { description: 'View all certification tracks',                            group: CERTIFICATION_TRACK_GROUP },
  [UserPermissionEnum.CertificationTrackCreate]: { description: 'Create certification tracks',                              group: CERTIFICATION_TRACK_GROUP },
  [UserPermissionEnum.CertificationTrackUpdate]: { description: 'Update certification tracks and manage subject track links', group: CERTIFICATION_TRACK_GROUP },
  [UserPermissionEnum.CertificationTrackDelete]: { description: 'Delete certification tracks',                              group: CERTIFICATION_TRACK_GROUP },
};

export async function seedPermissions(dataSource: DataSource): Promise<Permission[]> {
  const repo = dataSource.getRepository(Permission);

  for (const [, value] of Object.entries(UserPermissionEnum)) {
    const meta = PERMISSION_META[value as UserPermissionEnum];
    const exists = await repo.findOne({ where: { permission: value } });

    if (!exists) {
      await repo.save(repo.create({ permission: value, description: meta.description, group: meta.group }));
    } else if (exists.group !== meta.group || exists.description !== meta.description) {
      await repo.save({ ...exists, description: meta.description, group: meta.group });
    }
  }

  const all = await repo.find({ order: { id: 'ASC' } });
  console.log(`  ✔ Permissions: ${all.length} records`);
  return all;
}
