import { BadRequestException } from '@nestjs/common';
import { Model } from 'sequelize/types';

export const RenameBeforeDelete =
    () =>
    async (instance: any, options: any): Promise<void> => {
        if (!instance.name) return;
        const append = 'deleted';
        instance.name += ` (${append})_${instance.id}`;
        await instance.save({
            transaction: options.transaction,
        });
    };

export const RenameBeforeRestore =
    () =>
    async (instance: any, options: any): Promise<void> => {
        if (!instance.name) return;
        const replace = 'deleted';
        const name = instance.name
            .replace(new RegExp(`\\s\\(${replace}\\)_.+$`), '')
            .trim();
        instance.name = name;
        await instance.save({
            transaction: options.transaction,
        });
    };

export const PreventSoftDeleteIfModelExists =
    (model: any) =>
    async (instance: any): Promise<void> => {
        const questions = await model.findAll({
            attributes: ['name'],
            where: { [`${instance.constructor.name}Id`]: instance.id },
            raw: true,
        });
        if (questions.length) {
            throw new BadRequestException(
                `Cannot delete a ${
                    instance.constructor.name
                } with questions linked to it (${questions.map(
                    (c) => c.name,
                )}).`,
            );
        }
    };
