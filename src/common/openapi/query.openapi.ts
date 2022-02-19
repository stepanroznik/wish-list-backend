import { ApiQueryOptions } from '@nestjs/swagger';

export const INCLUDE_DELETED_QUERY = 'include-deleted';
export const includeDeletedQuery: ApiQueryOptions = {
    name: INCLUDE_DELETED_QUERY,
    type: Boolean,
    required: false,
    description:
        'If the requested record has been soft-deleted, it will be returned if this parameter is true, otherwise 404 will be returned',
};

export const INCLUDE_DELETED_ARRAY_QUERY = 'include-deleted';
export const includeDeletedArrayQuery: ApiQueryOptions = {
    name: INCLUDE_DELETED_ARRAY_QUERY,
    type: Boolean,
    required: false,
    description:
        'If true, the returned array will also contain all soft-deleted records.',
};

export const WHERE_QUERY = 'where';
export const whereQuery: ApiQueryOptions = {
    name: WHERE_QUERY,
    type: 'object',
    style: 'deepObject',
    required: false,
};

export const FORCE_QUERY = 'force';
export const forceQuery: ApiQueryOptions = {
    name: FORCE_QUERY,
    type: Boolean,
    required: false,
    description:
        'If true, the record will be hard-deleted without the option to recover it later (as oposed to the default soft-deletion)',
};

export const RESTORE_QUERY = 'restore';
export const restoreQuery: ApiQueryOptions = {
    name: RESTORE_QUERY,
    type: Boolean,
    required: false,
    description: 'If the record has been soft-deleted, it will be restored.',
};
