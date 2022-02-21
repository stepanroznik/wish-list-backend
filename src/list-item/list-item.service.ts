import {
    ConflictException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import Sequelize from 'sequelize';
import { InjectModel } from '@nestjs/sequelize';
import {
    IQuestionAttributes,
    IQuestionCreationAttributes,
    Question,
} from './entities/list-item.entity';
import { LoggerService } from '../common/logger/logger.service';

interface IServiceFindAllOptions {
    where?: Record<string, any>;
    includeDeleted?: boolean;
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
export class QuestionService {
    constructor(
        @InjectModel(Question)
        private readonly questionRepository: typeof Question,
        private readonly logger: LoggerService,
    ) {
        this.logger.setContext(QuestionService.name);
    }

    async create(questionsToCreate: IQuestionCreationAttributes[]) {
        this.logger.debug('Creating a question!!', questionsToCreate);
        try {
            return await this.questionRepository.bulkCreate(questionsToCreate);
        } catch (e) {
            if (e instanceof Sequelize.UniqueConstraintError)
                throw new ConflictException(e.message);
            else throw e;
        }
    }

    async findAll(
        opts: IServiceFindAllOptions = {
            includeDeleted: false,
            where: null,
        },
    ) {
        if (opts.where) this.logger.debug('where:', opts.where);
        const questions = await this.questionRepository.findAll({
            where: opts.where,
            paranoid: !opts.includeDeleted,
            order: [
                ['isPrimary', 'DESC'],
                ['id', 'ASC'],
            ],
        });
        return questions;
    }

    async findOne(
        id: string,
        opts: IServiceFindOneOptions = {
            includeDeleted: false,
        },
    ) {
        const question = await this.questionRepository.findByPk(id, {
            paranoid: !opts.includeDeleted,
        });
        if (!question)
            throw new NotFoundException(`Question with id ${id} not found.`);
        return question;
    }

    async update(
        id: string,
        questionToUpdate: Partial<IQuestionAttributes>,
        opts: IServiceUpdateOptions = { restore: false },
    ) {
        const question = await this.questionRepository.findByPk(id, {
            paranoid: !opts.restore,
        });
        if (!question)
            throw new NotFoundException(`Question with id ${id} not found.`);
        try {
            await question.update(questionToUpdate);
            if (opts.restore) await question.restore();
            return question;
        } catch (e) {
            if (e instanceof Sequelize.UniqueConstraintError)
                throw new ConflictException(e.message);
            else throw e;
        }
    }

    async remove(id: string, opts: IServiceRemoveOptions = { force: false }) {
        const question = await this.questionRepository.findByPk(id, {
            paranoid: !opts.force,
        });
        if (!question) {
            throw new NotFoundException(`Question with id ${id} not found.`);
        }
        await question.destroy({ force: opts.force });
    }
}
