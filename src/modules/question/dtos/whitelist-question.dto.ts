import { IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WhitelistQuestionDto {
  @ApiProperty({ example: 21 })
  @IsNumber()
  questionId: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  isWhitelisted: boolean;
}
