import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormConfigService } from './typeorm-config/typeorm-config.service';
const isDbDisabled = process.env.DISABLE_DB === 'true';
@Module({
  imports: [
    // Conditionally import TypeOrmModule based on environment variable
    // TypeOrmModule.forRootAsync({
    //   useClass: TypeormConfigService,
    // }),
     ...(!isDbDisabled
      ? [TypeOrmModule.forRootAsync({
      useClass: TypeormConfigService,
    })] : [])
  ]
})
export class DatabaseModule {}
