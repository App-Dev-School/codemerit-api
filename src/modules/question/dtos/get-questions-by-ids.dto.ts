import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  ArrayNotEmpty,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class GetQuestionsByIdsDto {
   @ApiPropertyOptional({
    type: [Number],
    example: [1, 2, 3],
    description: 'Array of subject IDs',
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  subjectIds?: number[];

   @ApiPropertyOptional({
    type: [Number],
    example: [10, 20, 30],
    description: 'Array of topic IDs',
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  topicIds?: number[];
  
@ApiPropertyOptional({
    type: [Number],
    example: [100, 200],
    description: 'Array of job IDs',
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  jobIds?: number[];
}
