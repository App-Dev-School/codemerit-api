import { IsInt, IsOptional, IsString, MaxLength } from 'class-validator';

export class GrantBadgeDto {
  @IsInt()
  userId: number;

  @IsInt()
  badgeId: number;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  note?: string;
}
