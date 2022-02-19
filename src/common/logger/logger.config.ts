import { registerAs } from '@nestjs/config';

export default registerAs('logger', () => ({
    console: {
        level: process.env.LOGGER_CONSOLE_LEVEL || 'info',
    },
}));
