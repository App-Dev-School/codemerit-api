import { IsString, IsBoolean, IsOptional, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOptionDto {
  @ApiPropertyOptional({
    description: '1003',
    example: '1001',
  })
  @IsOptional()
  @IsInt({ message: 'ID must be an integer' })
  id: number;

  @ApiProperty({
    description: 'Text of the option',
    example: '42 is the correct answer',
  })
  @IsString({ message: 'Option must be a string' })
  option: string;

  @ApiProperty({
    description: 'Indicates if this option is correct',
    example: true,
  })
  @IsBoolean({ message: 'Correct must be a boolean (true or false)' })
  correct: boolean;

  @ApiPropertyOptional({
    description: 'Optional comment or explanation for the option',
    example: 'Because 42 is the meaning of life',
  })
  @IsOptional()
  @IsString({ message: 'Comment must be a string if provided' })
  comment?: string;

  @ApiPropertyOptional({
    description: 'ID of the related question',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'Question ID must be an integer' })
  questionId?: number;
}
