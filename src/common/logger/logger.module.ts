import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LoggerOptions } from './logger';
import loggerConfig from './logger.config';
import { Logger, LoggerService } from './logger.service';

@Global()
@Module({
    imports: [ConfigModule.forFeature(loggerConfig)],
    providers: [Logger, LoggerService],
    exports: [LoggerService],
})
export class LoggerModule {
    static register(options: LoggerOptions): DynamicModule {
        return {
            module: LoggerModule,
            providers: [
                {
                    provide: loggerConfig.KEY,
                    useValue: options,
                },
                Logger,
                LoggerService,
            ],
        };
    }
}
