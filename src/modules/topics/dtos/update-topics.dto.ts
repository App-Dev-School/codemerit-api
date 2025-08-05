import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { TopicLabel } from 'src/common/enum/TopicLabel.enum';

export class UpdateTopicDto {
  @ApiPropertyOptional({ description: 'Title of the topic', example: 'Forms in Angular' })
  @IsOptional()
  @IsString({ message: 'Title must be a string' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Subject id associated with the topic',
    example: 3,
  })
  @IsOptional()
  //@IsInt({ message: 'Subject ID must be an integer' })
  subjectId: number;


  @ApiPropertyOptional({
    description: 'Label for the topic',
    example: 'Angular',
  })
  @IsOptional()
  @IsEnum(TopicLabel, { message: 'Invalid label value' })
  label?: TopicLabel;

  @ApiPropertyOptional({ description: 'Slug for the topic URL', example: 'forms-in-angular' })
  @IsOptional()
  @IsString({ message: 'Slug must be a string' })
  slug?: string;

  @ApiPropertyOptional({ description: 'Order index for the topic', example: 16 })
  @IsOptional()
  @IsInt({ message: 'Order must be an integer' })
  @Min(0, { message: 'Order must be zero or a positive number' })
  order?: number;

  @ApiPropertyOptional({ description: 'Coverage of topic in subject', example: 16 })
  @IsOptional()
  @IsInt({ message: 'Weight must be an integer' })
  @Min(0, { message: 'Weight must be zero or a positive number' })
  weight?: number;

  @ApiPropertyOptional({ description: 'Popularity index for the topic', example: 16 })
  @IsOptional()
  @IsInt({ message: 'Popularity must be an integer' })
  @Min(0, { message: 'Popularity must be zero or a positive number' })
  popularity?: number;

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
