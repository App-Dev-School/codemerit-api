import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateEmailNotificationDto {
  @ApiProperty()
  @IsInt()
  userId: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  dataId?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  dataTitle?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyEmail?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifySMS?: boolean;
}
