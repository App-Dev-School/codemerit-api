import {
  IsArray,
  ArrayNotEmpty,
  IsOptional,
  ValidateIf,
} from 'class-validator';

export class GetQuestionsByIdsDto {
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  subjectIds?: number[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  topicIds?: number[];

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  jobIds?: number[];
}
