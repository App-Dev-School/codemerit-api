export class TopicListDto {
  id: number;
  title: string;
  description: string;
  subjectId: number;
  subjectName: string;

  parent?: {
    title: string;
    description: string;
    subjectId: number;
    subjectName: string;
  };
}
