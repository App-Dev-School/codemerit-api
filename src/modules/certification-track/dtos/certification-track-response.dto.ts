export class CertTrackSubjectTrackDto {
  id: number;
  title: string;
  slug: string;
  subjectId: number;
  subjectName: string;
  topicCount: number;
}

export class CertificationTrackResponseDto {
  id: number;
  jobRoleId: number;
  jobRoleTitle: string;
  title: string;
  description: string;
  sortOrder: number;
  isPublished: boolean;
  subjectTrackCount: number;
  subjectTracks: CertTrackSubjectTrackDto[];
}
