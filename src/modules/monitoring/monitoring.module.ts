import { Module } from '@nestjs/common';
import { MonitoringController } from './monitoring/monitoring.controller';

@Module({
  controllers: [MonitoringController]
})
export class MonitoringModule {}
