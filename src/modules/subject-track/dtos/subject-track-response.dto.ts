export class SubjectTrackTopicDto {
  id: number;
  title: string;
  slug: string;
  label: string;
}

export class SubjectTrackResponseDto {
  id: number;
  subjectId: number;
  subjectName: string;
  title: string;
  slug: string;
  description: string;
  sortOrder: number;
  isPublished: boolean;
  topicCount: number;
  topics: SubjectTrackTopicDto[];
}
