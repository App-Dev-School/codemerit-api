import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, Min } from 'class-validator';

export class GetLessonsDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  n?: number = 10;

  @IsOptional()
  @IsIn(['all'])
  fetch?: 'all';
}
