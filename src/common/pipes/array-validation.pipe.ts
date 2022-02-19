import {
    ArgumentMetadata,
    BadRequestException,
    mixin,
    PipeTransform,
    Type,
    ValidationPipe,
} from '@nestjs/common';
import { memoize } from 'lodash';

export const ArrayValidationPipe: <T>(
    itemType: Type<T>,
) => Type<PipeTransform> = memoize(createArrayValidationPipe);

function createArrayValidationPipe<T>(itemType: Type<T>): Type<PipeTransform> {
    class MixinArrayValidationPipe
        extends ValidationPipe
        implements PipeTransform
    {
        transform(values: T[], metadata: ArgumentMetadata): Promise<any[]> {
            if (!Array.isArray(values)) {
                return Promise.reject(new BadRequestException());
            }

            return Promise.all(
                values.map((value) =>
                    super.transform(value, { ...metadata, metatype: itemType }),
                ),
            );
        }
    }

    return mixin(MixinArrayValidationPipe);
}
