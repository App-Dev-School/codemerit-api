export class TopicListDto {
  id: number;
  title: string;
  description: string;
  slug?: string;
  subjectId: number;
  subjectName: string;
  subTopics?: TopicDto[];
  coverage?: number
}
export class TopicDto {
  id: number;
  title: string;
  description: string;
  // subjectId: number;
  // subjectName: string;
}
export class TopicListItemDto {
  id: number;
  title: string;
  description: string;
  subjectId: number;
  subjectName: string;
  slug: string;
  label: string;
  votes?: number;
  isPublished: boolean;
  coverage?: number;
}