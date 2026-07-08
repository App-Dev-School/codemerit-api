import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt } from 'class-validator';

export class LinkTopicsDto {
  @ApiProperty({ type: [Number], description: 'Topic IDs to link to this track', example: [1, 2, 3] })
  @IsArray()
  @IsInt({ each: true })
  topicIds: number[];
}
