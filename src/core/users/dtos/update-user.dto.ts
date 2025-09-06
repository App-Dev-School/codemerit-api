import {
  IsOptional,
  IsString,
  IsEmail,
  IsEnum,
  Length,
  IsInt,
  IsNumber,
} from 'class-validator';
import { UserRoleEnum } from '../enums/user-roles.enum';
import { AccountStatusEnum } from '../enums/account-status.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsInt()
  id?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 50)
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 50)
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 20)
  username?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(UserRoleEnum)
  role?: UserRoleEnum;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  designation?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 50)
  city?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 50)
  country?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 50)
  mobile?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 100)
  image?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 50)
  level?: string;

  @ApiPropertyOptional()
  @IsOptional()
  points?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsEnum(AccountStatusEnum)
  accountStatus?: AccountStatusEnum;
}
