/* eslint-disable @typescript-eslint/no-empty-function */
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import { toggleFlagTimeout } from '../../test/utils';
import { LoggerModule } from '../common/logger/logger.module';
import {
    IQuestionCreationAttributes,
    Question,
} from './entities/question.entity';
import { QuestionMapper } from './question.mapper';
import { QuestionService } from './question.service';

const mockQuestionMapper: {
    fromDto?: (x) => any;
    toDto?: (x) => any;
} = {
    fromDto: (x) => JSON.parse(JSON.stringify(x)),
    toDto: (x) => JSON.parse(JSON.stringify(x)),
};

const mockQuestionRepository: {
    bulkCreate?: (x) => Promise<any>;
    findAll?: (x) => Promise<any>;
    findByPk?: (x) => Promise<any>;
    update?: (x, y) => Promise<any>;
    destroy?: (x) => Promise<any>;
} = {};

describe('QuestionService', () => {
    let service: QuestionService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [LoggerModule.register({ silent: true })],
            providers: [
                QuestionService,
                {
                    provide: QuestionMapper,
                    useValue: mockQuestionMapper,
                },
                {
                    provide: getModelToken(Question),
                    useValue: mockQuestionRepository,
                },
            ],
        }).compile();
        service = module.get<QuestionService>(QuestionService);
    });

    it('is defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('creates questions from a valid data array', async () => {
            const questionsToCreate: IQuestionCreationAttributes[] = [
                {
                    name: 'test',
                    position: 'test',
                    tagExtractionScript: 'test',
                    tagBubbleMapping: { test: 'tost' },
                    SourceId: '5fa2d83a-5c5f-4c9b-9759-7f08415791f1',
                },
            ];
            mockQuestionRepository.bulkCreate = jest.fn(async (x) => x);
            const questions = await service.create(questionsToCreate);
            expect(Array.isArray(questions)).toBe(true);
            expect(questions).toEqual(questionsToCreate);
        });

        it('throws an error with invalid data', async () => {
            const questionsToCreate = [
                {
                    name: null,
                    position: 'test',
                    tagExtractionScript: 'test',
                    tagBubbleMapping: { test: 'tost' },
                    SourceId: '5fa2d83a-5c5f-4c9b-9759-7f08415791f1',
                },
            ];
            mockQuestionRepository.bulkCreate = jest.fn(async () => {
                throw new Error('name cannot be null');
            });
            try {
                await service.create(questionsToCreate);
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
            }
        });
    });

    describe('findAll', () => {
        mockQuestionRepository.findAll = jest.fn(async () => {
            return [
                {
                    name: 'test',
                    position: 'test',
                    tagExtractionScript: 'test',
                    tagBubbleMapping: { test: 'tost' },
                    SourceId: '5fa2d83a-5c5f-4c9b-9759-7f08415791f1',
                },
            ];
        });
        it('returns an array', async () => {
            const questions = await service.findAll();
            expect(Array.isArray(questions)).toBe(true);
        });
        it('contains all properties', async () => {
            const questions = await service.findAll();
            expect(questions[0]).toHaveProperty('name');
            expect(questions[0]).toHaveProperty('position');
            expect(questions[0]).toHaveProperty('tagExtractionScript');
            expect(questions[0]).toHaveProperty('tagBubbleMapping');
            expect(questions[0]).toHaveProperty('SourceId');
            expect(questions[0].name).toEqual('test');
            expect(questions[0].position).toEqual('test');
            expect(questions[0].tagExtractionScript).toEqual('test');
            expect(questions[0].tagBubbleMapping).toEqual({ test: 'tost' });
            expect(questions[0].SourceId).toEqual(
                '5fa2d83a-5c5f-4c9b-9759-7f08415791f1',
            );
        });
    });

    describe('findOne', () => {
        it('contains all properties', async () => {
            mockQuestionRepository.findByPk = jest.fn(async () => {
                return {
                    name: 'test',
                    position: 'test',
                    tagExtractionScript: 'test',
                    tagBubbleMapping: { test: 'tost' },
                    SourceId: '5fa2d83a-5c5f-4c9b-9759-7f08415791f1',
                };
            });
            const question = await service.findOne('');
            expect(question).toHaveProperty('name');
            expect(question).toHaveProperty('position');
            expect(question).toHaveProperty('tagExtractionScript');
            expect(question).toHaveProperty('tagBubbleMapping');
            expect(question).toHaveProperty('SourceId');
            expect(question.name).toEqual('test');
            expect(question.position).toEqual('test');
            expect(question.tagExtractionScript).toEqual('test');
            expect(question.tagBubbleMapping).toEqual({ test: 'tost' });
            expect(question.SourceId).toEqual(
                '5fa2d83a-5c5f-4c9b-9759-7f08415791f1',
            );
        });

        it('throws an error when it does not exist', async () => {
            mockQuestionRepository.findByPk = jest.fn(async () => {
                return null;
            });
            try {
                await service.findOne('');
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundException);
            }
        });
    });

    describe('update', () => {
        it('updates a question from valid data', async () => {
            const payload = {
                name: 'test2',
            };
            const mockUpdate = jest.fn((payload) => {
                return payload;
            });
            mockQuestionRepository.findByPk = jest.fn(async () => {
                return {
                    name: 'test',
                    async update(payload) {
                        mockUpdate(payload);
                        this.name = payload.name;
                    },
                };
            });
            const question = await service.update('', payload);
            expect(mockUpdate).toHaveBeenCalledWith(payload);
            expect(question).toMatchObject(payload);
        });

        it('throws an error when it does not exist', async () => {
            mockQuestionRepository.findByPk = jest.fn(async () => {
                return null;
            });
            try {
                await service.update('', { name: 'test' });
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundException);
            }
        });
    });

    describe('remove', () => {
        it('deletes a question', async () => {
            const observer = { isFinished: false };
            const mockDestroy = jest.fn(() =>
                toggleFlagTimeout(observer, 'isFinished', 200),
            );
            mockQuestionRepository.findByPk = jest.fn(async () => ({
                destroy: mockDestroy,
            }));
            await service.remove('');
            expect(observer.isFinished).toBe(true);
        });

        it('throws an error when it does not exist', async () => {
            mockQuestionRepository.findByPk = jest.fn(async () => {
                return null;
            });
            try {
                await service.remove('');
            } catch (e) {
                expect(e).toBeInstanceOf(NotFoundException);
            }
        });
    });
});
