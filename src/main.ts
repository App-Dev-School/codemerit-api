import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { configDotenv } from 'dotenv';
import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { LoggerService } from './common/services/logger.service';
import { IAppConfig, appConfig } from './config/app-config';
import { GlobalExceptionsFilter } from './common/filters/global-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
// import { GlobalExceptionFilter } from './common/filters/global-exception.old.filter';

configDotenv({
  path: `.env`,
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const loggerService = app.get<LoggerService>(LoggerService);

  const config: IAppConfig = app.get<IAppConfig>(appConfig.KEY);

  app.useGlobalInterceptors(new ResponseInterceptor());
  app.useGlobalFilters(new GlobalExceptionsFilter());
  /* Add Swagger  */
  const options = new DocumentBuilder()
    .setTitle('CodeMerit API')
    .setDescription('Your API description')
    .setVersion('1.0')
    .addServer('http://localhost:3000/', 'Local environment')
    .addServer('https://staging.yourapi.com/', 'Staging')
    .addServer('https://production.yourapi.com/', 'Production')
    .addTag('Your API Tag')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);
  /* Add Global Validation Pipe  */
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     transform: true
  //   }),
  // );

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const result = errors.map((error) => ({
          property: error.property,
          message: error.constraints[Object.keys(error.constraints)[0]],
        }));
        Logger.log('GlobalPipe', JSON.stringify(result));
        return new BadRequestException(result);
      },
      stopAtFirstError: true,
    }),
  );

  // Set global API prefix
  // app.setGlobalPrefix('api');
  await app.listen(config.port, () => {
    console.log(`Server is listening on port ${config.port}`);
    console.log('##### DATABASE_URL:', process.env.DATABASE_URL);
    console.log('##### DISABLE_DB:', process.env.DISABLE_DB);
  });
}
bootstrap();
