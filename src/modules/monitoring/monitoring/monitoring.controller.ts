import { Controller, Get } from '@nestjs/common';
import * as os from 'os';
import { Public } from 'src/core/auth/decorators/public.decorator';
@Public()
@Controller('monitoring')
export class MonitoringController {
  private readonly startTime = Date.now();

  @Get('health')
  health() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('metrics')
  metrics() {
    const seconds = Math.floor((Date.now() - this.startTime) / 1000);
    return {
      uptime_seconds: seconds,
      memoryUsage: process.memoryUsage(),
      cpuLoad: os.loadavg(),
      freeMemory: os.freemem(),
      totalMemory: os.totalmem(),
    };
  }
}

