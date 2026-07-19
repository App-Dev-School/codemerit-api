import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Badge } from 'src/common/typeorm/entities/badge.entity';
import { UserBadge } from 'src/common/typeorm/entities/user-badge.entity';
import { BadgeQueryService } from './providers/badge-query.service';

/**
 * Deliberately separate from AchievementModule: this has no dependency on MasterModule (or
 * anything else), so both AchievementModule and MasterModule can import it without creating a
 * cycle — AchievementModule already imports MasterModule for its own providers.
 */
@Module({
  imports: [TypeOrmModule.forFeature([Badge, UserBadge])],
  providers: [BadgeQueryService],
  exports: [BadgeQueryService],
})
export class BadgeQueryModule {}
