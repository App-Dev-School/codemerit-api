import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsInt } from 'class-validator';

export class LinkSubjectTracksDto {
  @ApiProperty({ type: [Number], description: 'Subject Track IDs to link to this certification track', example: [1, 2] })
  @IsArray()
  @IsInt({ each: true })
  subjectTrackIds: number[];
}
