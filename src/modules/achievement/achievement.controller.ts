import { Controller, Get, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AchievementService } from './providers/achievement.service';

@Controller('apis/achievements')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('my-badges')
  async getMyBadges(@Request() req: any) {
    return this.achievementService.getUserBadges(req.user.id);
  }
}
