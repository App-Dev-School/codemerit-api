import { Body, Controller, Get, Post, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BadgeAwardMethodEnum } from 'src/common/enum/badge-award-method.enum';
import { BadgeScopeEnum } from 'src/common/enum/badge-scope.enum';
import { GrantBadgeDto } from './dtos/grant-badge.dto';
import { AchievementService } from './providers/achievement.service';

@Controller('apis/achievements')
export class AchievementController {
  constructor(private readonly achievementService: AchievementService) {}

  /** ?scopeType=Subject&scopeId=12 narrows to one subject/job-role/topic's badges, e.g. for a
   * contextual badge widget on that subject's dashboard — omit both for the full collection.
   * ?userId=<id> fetches that user's badges instead of the caller's own — e.g. so the Admin
   * "Grant Badge" picker can preview a learner's current badges before granting one. Gated:
   * Admins can pass any userId in any scope; everyone else must also pass a scopeType (+scopeId
   * unless Global) they hold a matching Badge:Grant permission for — see
   * AchievementService.ensureCanViewUserBadges for why an unscoped request isn't allowed. */
  @UseGuards(AuthGuard('jwt'))
  @Get('my-badges')
  async getMyBadges(
    @Request() req: any,
    @Query('scopeType') scopeType?: BadgeScopeEnum,
    @Query('scopeId') scopeId?: string,
    @Query('userId') userId?: string,
  ) {
    return this.achievementService.getUserBadgesForViewer(
      { id: req.user.id, role: req.user.role },
      userId ? +userId : req.user.id,
      scopeType,
      scopeId ? +scopeId : undefined,
    );
  }

  /** Catalog of badge definitions, e.g. for an interviewer picking which badge to grant.
   * ?scopeType=Subject&scopeId=12 narrows to badges defined for that subject; scopeId requires
   * scopeType alongside it (scopeId alone is ambiguous — it's a Subject/JobRole/Topic id depending
   * on scopeType). ?isManuallyGrantable=true narrows to badges the grant endpoint will accept —
   * the authoritative filter for a grant picker (awardMethod is a display hint only). */
  @UseGuards(AuthGuard('jwt'))
  @Get('badges')
  async getBadgeCatalog(
    @Query('scopeType') scopeType?: BadgeScopeEnum,
    @Query('scopeId') scopeId?: string,
    @Query('awardMethod') awardMethod?: BadgeAwardMethodEnum,
    @Query('isManuallyGrantable') isManuallyGrantable?: string,
  ) {
    return this.achievementService.getBadgeCatalog(
      scopeType,
      scopeId ? +scopeId : undefined,
      awardMethod,
      isManuallyGrantable !== undefined ? isManuallyGrantable === 'true' : undefined,
    );
  }

  /** Manually award a MANUAL-method badge to a user, e.g. an interviewer granting
   * "JavaScript Expert" after an interview. Gated by the Badge:Grant permission (or Admin role). */
  @UseGuards(AuthGuard('jwt'))
  @Post('badges/grant')
  async grantBadge(@Body() dto: GrantBadgeDto, @Request() req: any) {
    return this.achievementService.grantBadge(
      { id: req.user.id, role: req.user.role },
      dto,
    );
  }
}
