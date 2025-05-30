import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsInt, IsOptional, IsBoolean, IsUrl, Min, IsEnum } from 'class-validator';
import { LabelEnum } from 'src/common/enum/label.enum';

export class UpdateTopicDto {
   @ApiPropertyOptional({ description: 'ID of the topic', example: 121 })
  @IsInt({ message: 'ID must be an integer' })
  @Min(1, { message: 'ID must be a positive number' })
  id: number;

  @ApiPropertyOptional({ description: 'Title of the topic', example: 'Forms in Angular' })
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  title?: string;


  @ApiPropertyOptional({
    description: 'Subject id associated with the topic',
    example: 3,
  })
  @IsInt({ message: 'Subject ID must be an integer' })
  @Min(1, { message: 'Subject ID must be a positive integer' })
  subjectId: number;


  @ApiPropertyOptional({
    description: 'Label for the topic',
    example: 'Angular',
  })
  @IsOptional()
  @IsEnum(LabelEnum, { message: 'Invalid label value' })
  label?: LabelEnum;

  @ApiPropertyOptional({ description: 'Color tag for the topic', example: 'red' })
  @IsOptional()
  @IsString({ message: 'Color must be a string' })
  color?: string;

  @ApiPropertyOptional({ description: 'Slug for the topic URL', example: 'forms-in-angular' })
  @IsOptional()
  @IsString({ message: 'Slug must be a string' })
  slug?: string;
  
  @ApiPropertyOptional({ description: 'Order index for the topic', example: 16 })
  @IsOptional()
  @IsInt({ message: 'Order must be an integer' })
  @Min(0, { message: 'Order must be zero or a positive number' })
  order?: number;

  @ApiPropertyOptional({ description: 'Parent topic ID', example: 1 })
  @IsOptional()
  @IsInt({ message: 'Parent must be an integer' })
  parent?: number;


  @ApiPropertyOptional({ description: 'Publish status', example: true })
  @IsOptional()
  @IsBoolean({ message: 'is published must be a boolean' })
  isPublished?: boolean;

    @ApiPropertyOptional({
    description: 'Description of the topic',
    example: 'Working with template-driven and reactive forms in Angular.',
  })
  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @ApiPropertyOptional({ description: 'Learning goal for the topic', example: '' })
  @IsOptional()
  @IsString({ message: 'Goal must be a string' })
  goal?: string;
}
