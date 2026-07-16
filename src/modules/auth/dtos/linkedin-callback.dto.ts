import { IsNotEmpty, IsString } from 'class-validator';

export class LinkedinCallbackDto {
  @IsString()
  @IsNotEmpty()
  code: string;
}
