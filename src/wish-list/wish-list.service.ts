import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import Sequelize from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import {
    IWishListAttributes,
    IWishListCreationAttributes,
    WishList,
} from './entities/wish-list.entity';
import { LoggerService } from '../common/logger/logger.service';
import { Question } from '../question/entities/question.entity';

interface IServiceFindAllOptions {
    where?: Record<string, any>;
    includeDeleted?: boolean;
    includeAnswers?: boolean;
}

interface IServiceFindOneOptions {
    includeDeleted?: boolean;
}

interface IServiceUpdateOptions {
    restore: boolean;
}

interface IServiceRemoveOptions {
    force: boolean;
}
@Injectable()
export class WishListService {
    constructor(
        @InjectModel(WishList)
        private readonly wishListRepository: typeof WishList,
        private readonly logger: LoggerService,
    ) {
        this.logger.setContext(WishListService.name);
    }

    async create(partiesToCreate: IWishListCreationAttributes[]) {
        this.logger.debug('Creating a wishList!!', partiesToCreate);
        try {
            return await this.wishListRepository.bulkCreate(partiesToCreate);
        } catch (e) {
            if (e instanceof Sequelize.UniqueConstraintError)
                throw new ConflictException(e.message);
            else throw e;
        }
    }

    async findAll(
        opts: IServiceFindAllOptions = {
            includeDeleted: false,
            includeAnswers: false,
            where: null,
        },
    ) {
        if (opts.where) this.logger.debug('where:', opts.where);
        const parties = await this.wishListRepository.findAll({
            where: opts.where,
            paranoid: !opts.includeDeleted,
            order: Sequelize.literal('random()'),
        });
        return parties;
    }

    async findOne(
        id: string,
        opts: IServiceFindOneOptions = {
            includeDeleted: false,
        },
    ) {
        const wishList = await this.wishListRepository.findByPk(id, {
            paranoid: !opts.includeDeleted,
        });
        if (!wishList)
            throw new NotFoundException(`WishList with id ${id} not found.`);
        return wishList;
    }

    async update(
        id: string,
        wishListToUpdate: Partial<IWishListAttributes>,
        opts: IServiceUpdateOptions = { restore: false },
    ) {
        const wishList = await this.wishListRepository.findByPk(id, {
            paranoid: !opts.restore,
        });
        if (!wishList)
            throw new NotFoundException(`WishList with id ${id} not found.`);
        try {
            await wishList.update(wishListToUpdate);
            if (opts.restore) await wishList.restore();
            return wishList;
        } catch (e) {
            if (e instanceof Sequelize.UniqueConstraintError)
                throw new ConflictException(e.message);
            else throw e;
        }
    }

    async remove(id: string, opts: IServiceRemoveOptions = { force: false }) {
        const wishList = await this.wishListRepository.findByPk(id, {
            paranoid: !opts.force,
        });
        if (!wishList) {
            throw new NotFoundException(`WishList with id ${id} not found.`);
        }
        await wishList.destroy({ force: opts.force });
    }
}
