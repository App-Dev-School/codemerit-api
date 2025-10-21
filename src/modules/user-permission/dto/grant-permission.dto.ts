import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsInt, IsOptional } from 'class-validator';

export class GrantPermissionDto {

    @ApiProperty({ example: 101 })
    @IsInt()
    @IsNumber()
    userId: number;

    @ApiProperty({ example: 101 })
    @IsInt()
    @IsNumber()
    permissionId: number;

    @ApiPropertyOptional({ example: 'subject/topic' })
    @IsOptional()
    @IsString()
    resourceType: string;

    @ApiPropertyOptional({ example: 101 })
    @IsOptional()
    @IsInt()
    @IsNumber()
    resourceId: number;
}
