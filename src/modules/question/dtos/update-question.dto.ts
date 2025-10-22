import { PartialType } from '@nestjs/mapped-types';
import { CreateQuestionDto } from './create-question.dto';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber, IsEnum, IsArray } from 'class-validator';
import { QuestionTypeEnum } from 'src/common/enum/question-type.enum';

export class UpdateQuestionDto extends PartialType(CreateQuestionDto) {

    @ApiProperty({
        description: 'ID of the subject the question belongs to',
        example: 1,
    })
    @Type(() => Number)
    @IsNumber({}, { message: 'Subject ID must be a number' })
    subjectId: number;

    @ApiProperty({
        description: 'Specify question type',
        enum: QuestionTypeEnum,
        example: QuestionTypeEnum.Trivia,
        default: QuestionTypeEnum.General,
    })
    @IsEnum(QuestionTypeEnum, { message: 'Question type should be valid.' })
    questionType: QuestionTypeEnum;

    @ApiProperty({
        description: 'IDs of the topics associated with the question',
        example: [2, 3],
        isArray: true,
        type: Number,
    })
    @IsArray({ message: 'Topic IDs must be an array' })
    @Type(() => Number)
    @IsNumber({}, { each: true, message: 'Each topic ID must be a number' })
    topicIds: number[];

}
