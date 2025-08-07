import { PartialType } from '@nestjs/mapped-types';
import { CreateSkillRatingDto } from './create-skill-rating.dto';

export class UpdateSkillRatingDto extends PartialType(CreateSkillRatingDto) {}
