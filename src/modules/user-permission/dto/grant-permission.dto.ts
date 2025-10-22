import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNumber, IsInt, IsOptional, IsArray } from 'class-validator';

export class GrantPermissionDto {

    @ApiProperty({ example: 101 })
    @IsInt()
    @IsNumber()
    userId: number;

    @ApiProperty({
        description: 'IDs of the permission associated with the question',
        example: [2, 3],
        isArray: true,
        type: Number,
    })
    @IsArray({ message: 'Permission IDs must be an array' })
    @Type(() => Number)
    @IsNumber({}, { each: true, message: 'Each permission ID must be a number' })
    permissionIds: number[];


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
