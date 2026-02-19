import { IsNumber, IsEnum, IsBoolean, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { OrderingEnum, ModeEnum } from 'src/common/enum/quiz-settings.enum';

export class QuizSettingsDto {
  @ApiPropertyOptional({ description: 'Number of questions', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  numQuestions?: number = 10;

  @ApiPropertyOptional({ enum: OrderingEnum, default: OrderingEnum.DEFAULT })
  @IsOptional()
  @IsEnum(OrderingEnum)
  ordering?: OrderingEnum = OrderingEnum.DEFAULT;

  @ApiPropertyOptional({ enum: ModeEnum, default: ModeEnum.DEFAULT })
  @IsOptional()
  @IsEnum(ModeEnum)
  mode?: ModeEnum = ModeEnum.DEFAULT;

  @ApiPropertyOptional({ description: 'Show hint', default: false })
  @IsOptional()
  @IsBoolean()
  showHint?: boolean = false;

  @ApiPropertyOptional({ description: 'Show answers', default: false })
  @IsOptional()
  @IsBoolean()
  showAnswers?: boolean = false;

  @ApiPropertyOptional({ description: 'Enable navigation', default: false })
  @IsOptional()
  @IsBoolean()
  enableNavigation?: boolean = false;

  @ApiPropertyOptional({ description: 'Enable audio', default: false })
  @IsOptional()
  @IsBoolean()
  enableAudio?: boolean = false;

  @ApiPropertyOptional({ description: 'Enable timer', default: false })
  @IsOptional()
  @IsBoolean()
  enableTimer?: boolean = false;

  @ApiPropertyOptional({ description: 'Enable certificate', default: false })
  @IsOptional()
  @IsBoolean()
  enableCertificate?: boolean = false;
}
