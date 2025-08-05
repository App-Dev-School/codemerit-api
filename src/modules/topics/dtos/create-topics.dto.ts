import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsBoolean,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { TopicLabel } from 'src/common/enum/TopicLabel.enum';
export class CreateTopicDto {
  @ApiProperty({
    description: 'Title of the topic',
    example: 'Forms in Angular',
  })
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  title: string;

  @ApiProperty({
    description: 'Subject id associated with the topic',
    example: 3,
  })
  @IsInt({ message: 'Subject ID must be an integer' })
  subjectId: number;

    @ApiProperty({
    description: 'Display order for the topic',
    example: 16,
  })

  @IsOptional()
  label: TopicLabel;

  @ApiProperty({
    description: 'Display order for the topic',
    example: 16,
  })
  @IsInt({ message: 'Order must be an integer' })
  @Min(0, { message: 'Order must be zero or a positive integer' })
  order: number;

  @ApiPropertyOptional({
    description: 'Optional parent topic ID',
    example: 1234,
  })
  @IsOptional()
  @IsInt({ message: 'Parent must be an integer' })
  parent?: number;

  @ApiProperty({
    description: 'Whether the topic is published',
    example: true,
  })
  @IsBoolean({ message: 'is published must be a boolean' })
  isPublished: boolean;

  @ApiProperty({
    description: 'Detailed description of the topic',
    example: 'Working with template-driven and reactive forms in Angular.',
  })
  @IsString({ message: 'Description must be a string' })
  @IsNotEmpty({ message: 'Description is required' })
  description: string;
}
