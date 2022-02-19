import { ApiParamOptions } from '@nestjs/swagger';
type ApiParamOptionsWithFormat = ApiParamOptions & { format: string };

export const ID_PARAM = 'id';
export const idParam: ApiParamOptionsWithFormat = {
    name: ID_PARAM,
    type: 'string',
    format: 'uuid',
    example: '5e5815cc-bf97-11eb-8529-0242ac130003',
};
