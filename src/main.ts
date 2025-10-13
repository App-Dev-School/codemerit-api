import { BadRequestException, Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { configDotenv } from 'dotenv';
import { AppModule } from './app.module';
import { GlobalExceptionsFilter } from './common/filters/global-exception.filter';
import { AuditInterceptor } from './common/interceptors/audit.interceptor';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
import { IAppConfig, appConfig } from './config/app-config';
import { RequestDecryptionInterceptor } from './common/exceptions/request-decryption.interceptor';
import { CryptoService } from './common/utils/crypto.service';
import { ResponseEncryptionInterceptor } from './common/exceptions/response-encryption.interceptor';

configDotenv({
  path: `.env`,
});

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // const loggerService = app.get<LoggerService>(LoggerService);

  const config: IAppConfig = app.get<IAppConfig>(appConfig.KEY);

  // Enable CORS for localhost dev
  app.enableCors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        'http://localhost:3000',
        'http://localhost:4200',
        'http://apis.appdevops.in',
        'https://apis.appdevops.in',
        'https://appdevops.in',
      ];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const cryptoService = app.get(CryptoService);
  app.useGlobalInterceptors(
    new ResponseInterceptor(),
    new AuditInterceptor(),
    // new RequestDecryptionInterceptor(cryptoService),
    // new ResponseEncryptionInterceptor(cryptoService)
  );

  app.useGlobalFilters(new GlobalExceptionsFilter());
  /* Add Swagger  */
  const options = new DocumentBuilder()
    .setTitle('CodeMerit API')
    .setDescription('Rest API Documentation')
    .setVersion('1.0')
    .addServer('http://localhost:3000/', 'Local environment')
    .addServer('https://qa.appdevops.in/', 'Staging')
    .addServer('https://prod.appdevops.in/', 'Production')
    .addTag('CodeMerit')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api-docs', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      forbidUnknownValues: false,
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
  });
}
bootstrap();
