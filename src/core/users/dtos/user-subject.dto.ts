import { IsArray, IsInt, ArrayNotEmpty, ArrayUnique } from 'class-validator';
export class AddUserSubjectsDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique()
  @IsInt({ each: true })
  subjectIds: number[];
}
