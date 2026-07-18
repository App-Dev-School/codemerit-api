import {
  IsNotEmpty,
  IsString,
  IsObject,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GoogleCallbackDto {
  @IsNotEmpty()
  @IsString()
  idToken: string;
}
