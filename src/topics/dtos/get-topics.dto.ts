import { ArrayMinSize, ArrayNotEmpty, IsArray, IsDate, IsInt, IsOptional } from 'class-validator';

import { IntersectionType } from '@nestjs/swagger';

class GetTopicsBaseDto {
    @IsArray()
    @IsInt({ each: true })
    @ArrayNotEmpty()
    @ArrayMinSize(1)
    topicIds: number[];
}

export class GetTopicsDto extends IntersectionType(
    GetTopicsBaseDto
) {}
