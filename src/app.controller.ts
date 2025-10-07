import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/')
  getHello(): string {
    return this.appService.getHello();
  }

  //#Task3:Create a Badge Entity with name, description, image, points and generate CRUD
  //#Task4: Implement User Badges so that batch can be assigned to a user by system or another user
  //#Task5:Encrypt Response in Production Env
}
