import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber } from 'class-validator';

export class GetQuestionDto {
  @ApiProperty({
    description: 'ID of the subject the question belongs to',
    example: 1,
  })
  // @IsInt({ message: 'Subject ID must be an integer' })
  // @IsNumber({}, { message: 'Subject ID must be a number' })
  subjectId: number;

  // @ApiPropertyOptional({
  //   description: 'IDs of the topics associated with the question',
  //   example: [2, 3],
  //   isArray: true,
  //   type: Number,
  // })
  // @IsArray({ message: 'Topic IDs must be an array' })
  // @Type(() => Number)
  // @IsNumber({}, { each: true, message: 'Each topic ID must be a number' })
  // @IsOptional()
  // topicIds?: number[];
}
