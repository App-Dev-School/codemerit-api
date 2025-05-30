import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, } from 'class-validator';

export class GetTriviaDto {
  
    @ApiPropertyOptional({
      description: 'ID of the subject the question belongs to',
      example: 1,
    })
    @Type(() => Number)
    @IsNumber({}, { message: 'Subject ID must be a number' })
  @IsOptional()
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
