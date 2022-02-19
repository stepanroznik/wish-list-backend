import { ValidationPipe } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { LoggerService } from './common/logger/logger.service';
import appConfig from './config/app.config';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    app.enableCors();
    app.setGlobalPrefix('api');

    const apiSpec = new DocumentBuilder()
        .setTitle('Politický Kompas')
        .setDescription('Politický Kompas API')
        .setVersion('1.0')
        .addSecurity('BearerAuth', {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT',
        })
        .build();
    const document = SwaggerModule.createDocument(app, apiSpec);
    SwaggerModule.setup('api', app, document);

    const logger = (await app.resolve(LoggerService)).setContext('Main');
    const PORT = app.get<ConfigType<typeof appConfig>>(appConfig.KEY).app.port;

    await app.listen(PORT);
    logger.info(`Server started on port ${PORT}`);
}
bootstrap();
