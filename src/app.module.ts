import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { QuestionModule } from './question/question.module';
import { LoggerModule } from './common/logger/logger.module';
import rTracer from 'cls-rtracer';
import shortUUID from 'short-uuid';
import appConfig from './config/app.config';
import configValidation from './config/env.validation';
import { ConfigType } from '@nestjs/config';
import { WhereParserModule } from './common/where-parser/where-parser.module';
import { LoggerMiddleware } from './common/logger/logger.middleware';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { APP_FILTER } from '@nestjs/core';
import { WishListModule } from './wish-list/wish-list.module';
import parseDbUrl from 'parse-database-url';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
    imports: [
        ConfigModule.forRoot({
            validationSchema: configValidation,
            load: [appConfig],
        }),
        ServeStaticModule.forRoot({
            rootPath: join(__dirname, '..', 'public'),
        }),
        SequelizeModule.forRootAsync({
            useFactory: (configService: ConfigService) => {
                const dbEnvConfig =
                    configService.get<ConfigType<typeof appConfig>>(
                        'app',
                    ).database;
                const dbConfig = parseDbUrl(dbEnvConfig.url);
                return {
                    dialect: dbConfig.driver,
                    database: dbConfig.database,
                    username: dbConfig.user,
                    password: dbConfig.password,
                    host: dbConfig.host,
                    port: dbConfig.port,
                    autoLoadModels: true,
                    logging: false,
                    sync: { force: false },
                    define: { timestamps: true, paranoid: true },
                    dialectOptions: dbEnvConfig.ssl
                        ? {
                              ssl: {
                                  require: dbEnvConfig.ssl,
                                  rejectUnauthorized: false,
                              },
                          }
                        : undefined,
                };
            },
            imports: [ConfigModule],
            inject: [ConfigService],
        }),
        QuestionModule,
        WishListModule,
        LoggerModule,
        WhereParserModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(
                rTracer.expressMiddleware({
                    requestIdFactory: () => shortUUID().new(),
                }),
            )
            .forRoutes('*');
        consumer.apply(LoggerMiddleware).forRoutes('*');
    }
}
