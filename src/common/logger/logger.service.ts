import { Inject, Injectable, Scope } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import winston from 'winston';
import { initLogger } from './logger';
import loggerConfig from './logger.config';

@Injectable()
export class Logger {
    private logger: winston.Logger;

    constructor(
        @Inject(loggerConfig.KEY)
        private config: ConfigType<typeof loggerConfig>,
    ) {
        this.logger = initLogger(this.config);
    }

    getLogger() {
        return this.logger;
    }

    silence() {
        this.logger.silent = true;
        return this;
    }
}

@Injectable({ scope: Scope.TRANSIENT })
export class LoggerService {
    private logger: winston.Logger;

    constructor(logger: Logger) {
        this.logger = logger.getLogger();
    }

    silence() {
        this.logger.silent = true;
        return this;
    }

    setContext(context: string) {
        this.logger = this.logger.child({ namespace: context });
        return this;
    }

    silly(message: string, ...meta: any[]) {
        if (!this.logger.silent) this.logger.silly(message, { meta });
    }

    debug(message: string, ...meta: any[]) {
        if (!this.logger.silent) this.logger.debug(message, { meta });
    }

    log(message: string, ...meta: any[]) {
        if (!this.logger.silent) this.logger.info(message, { meta });
    }

    info(message: string, ...meta: any[]) {
        if (!this.logger.silent) this.logger.info(message, { meta });
    }

    warn(message: string, ...meta: any[]) {
        if (!this.logger.silent) this.logger.warn(message, { meta });
    }

    error(message: string, ...meta: any[]) {
        if (!this.logger.silent) this.logger.error(message, { meta });
    }
}
