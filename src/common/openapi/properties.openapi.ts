import { ApiPropertyOptions } from '@nestjs/swagger';

export const uuidProperty: ApiPropertyOptions = {
    type: 'string',
    format: 'uuid',
};

export const dateTimeProperty: ApiPropertyOptions = {
    type: 'string',
    format: 'date-time',
};
