import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'Visit www.codemerit.in to use the CodeMerit Skill Assessment App.';
  }
}
