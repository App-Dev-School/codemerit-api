import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, MaxLength } from 'class-validator';

export class UpdateUserProfileDto {
  @ApiPropertyOptional({
    example: 'https://linkedin.com/in/username',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  linkedinUrl?: string;

  @ApiPropertyOptional({ example: 'A brief about the user', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  about?: string;

  @ApiPropertyOptional({ example: '1234567890abcdef', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  googleId?: string;

  @ApiPropertyOptional({ example: 'linkedin-unique-id', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  linkedinId?: string;

  @ApiPropertyOptional({ example: 'google', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  auth_provider?: string;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  selfRatingDone?: boolean;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  playedQuiz?: boolean;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  takenInterview?: boolean;

  @ApiPropertyOptional({ example: false, default: false })
  @IsOptional()
  @IsBoolean()
  level1Assessment?: boolean;

  @ApiPropertyOptional({ example: true, default: false })
  @IsOptional()
  @IsBoolean()
  level2Assessment?: boolean;
}
