export class SubjectItemDto {
  id: number;
  title: string;
  description: string;
  subjectId: number;
  subjectName: string;
  slug: string;
  image: string;
  color?: string;
  isPublished: boolean;
  coverage?: number;
}
export class SubjectMiniDTO {
  id: number;
  title: string;
}

export class JobRoleWithSubjectsDTO {
  id: number;
  title: string;
  subjects: SubjectMiniDTO[];
}