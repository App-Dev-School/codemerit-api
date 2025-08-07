import { ApiProperty } from '@nestjs/swagger';
import { SkillTypeEnum } from 'src/common/enum/skill-type.enum';

export class SkillRatingResponseDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  skillId: number;

  @ApiProperty()
  skillName: string;

  @ApiProperty({ enum: SkillTypeEnum })
  skillType: SkillTypeEnum;

  @ApiProperty()
  rating: number;
}
