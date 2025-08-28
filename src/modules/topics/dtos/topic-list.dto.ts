export class TopicListDto {
  id: number;
  title: string;
  description: string;
  subjectId: number;
  subjectName: string;
  subTopics?: TopicDto[];
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
}