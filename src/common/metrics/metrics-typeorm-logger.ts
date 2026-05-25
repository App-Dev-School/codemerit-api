import { Logger, QueryRunner } from 'typeorm';
import { getCurrentMetricsStore } from '../metrics/metrics-async-storage';

export class MetricsTypeOrmLogger implements Logger {
  // Only increment query count for 'logQuery' events
  logQuery(query: string, parameters?: any[], queryRunner?: QueryRunner) {
    const store = getCurrentMetricsStore();
    if (store) {
      store.queryCount++;
    }
    // Optionally, log queries here if needed
    // console.log('[TypeORM Query]', query);
  }

  // Other logger methods (no-ops for now)
  logQueryError(error: string | Error, query: string, parameters?: any[], queryRunner?: QueryRunner) {}
  logQuerySlow(time: number, query: string, parameters?: any[], queryRunner?: QueryRunner) {}
  logSchemaBuild(message: string, queryRunner?: QueryRunner) {}
  logMigration(message: string, queryRunner?: QueryRunner) {}
  log(level: 'log' | 'info' | 'warn', message: any, queryRunner?: QueryRunner) {}
}
