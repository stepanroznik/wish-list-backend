/* eslint-disable @typescript-eslint/no-empty-function */
import { NotFoundException } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import { toggleFlagTimeout } from '../../test/utils';
import { LoggerModule } from '../common/logger/logger.module';
import { IWishListCreationAttributes, WishList } from './entities/wish-list.entity';
import { WishListMapper } from './wish-list.mapper';
import { WishListService } from './wish-list.service';

const mockWishListMapper: {
    fromDto?: (x) => any;
    toDto?: (x) => any;
} = {
    fromDto: (x) => JSON.parse(JSON.stringify(x)),
    toDto: (x) => JSON.parse(JSON.stringify(x)),
};

const mockWishListRepository: {
    bulkCreate?: (x) => Promise<any>;
    findAll?: (x) => Promise<any>;
    findByPk?: (x) => Promise<any>;
    update?: (x, y) => Promise<any>;
    destroy?: (x) => Promise<any>;
} = {};

describe('WishListService', () => {
    let service: WishListService;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            imports: [LoggerModule.register({ silent: true })],
            providers: [
                WishListService,
                {
                    provide: WishListMapper,
                    useValue: mockWishListMapper,
                },
                {
                    provide: getModelToken(WishList),
                    useValue: mockWishListRepository,
                },
            ],
        }).compile();
        service = module.get<WishListService>(WishListService);
    });

    it('is defined', () => {
        expect(service).toBeDefined();
    });

    describe('create', () => {
        it('creates parties from a valid data array', async () => {
            const partiesToCreate: IWishListCreationAttributes[] = [
                {
                    name: 'test',
                    position: 'test',
                    tagExtractionScript: 'test',
                    tagBubbleMapping: { test: 'tost' },
                    SourceId: '5fa2d83a-5c5f-4c9b-9759-7f08415791f1',
                },
            ];
            mockWishListRepository.bulkCreate = jest.fn(async (x) => x);
            const parties = await service.create(partiesToCreate);
            expect(Array.isArray(parties)).toBe(true);
            expect(parties).toEqual(partiesToCreate);
        });

        it('throws an error with invalid data', async () => {
            const partiesToCreate = [
                {
                    name: null,
                    position: 'test',
                    tagExtractionScript: 'test',
                    tagBubbleMapping: { test: 'tost' },
                    SourceId: '5fa2d83a-5c5f-4c9b-9759-7f08415791f1',
                },
            ];
            mockWishListRepository.bulkCreate = jest.fn(async () => {
                throw new Error('name cannot be null');
            });
            try {
                await service.create(partiesToCreate);
            } catch (e) {
                expect(e).toBeInstanceOf(Error);
            }
        });
    });

    describe('findAll', () => {
        mockWishListRepository.findAll = jest.fn(async () => {
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
            const parties = await service.findAll();
            expect(Array.isArray(parties)).toBe(true);
        });
        it('contains all properties', async () => {
            const parties = await service.findAll();
            expect(parties[0]).toHaveProperty('name');
            expect(parties[0]).toHaveProperty('position');
            expect(parties[0]).toHaveProperty('tagExtractionScript');
            expect(parties[0]).toHaveProperty('tagBubbleMapping');
            expect(parties[0]).toHaveProperty('SourceId');
            expect(parties[0].name).toEqual('test');
            expect(parties[0].position).toEqual('test');
            expect(parties[0].tagExtractionScript).toEqual('test');
            expect(parties[0].tagBubbleMapping).toEqual({ test: 'tost' });
            expect(parties[0].SourceId).toEqual(
                '5fa2d83a-5c5f-4c9b-9759-7f08415791f1',
            );
        });
    });

    describe('findOne', () => {
        it('contains all properties', async () => {
            mockWishListRepository.findByPk = jest.fn(async () => {
                return {
                    name: 'test',
                    position: 'test',
                    tagExtractionScript: 'test',
                    tagBubbleMapping: { test: 'tost' },
                    SourceId: '5fa2d83a-5c5f-4c9b-9759-7f08415791f1',
                };
            });
            const wishList = await service.findOne('');
            expect(wishList).toHaveProperty('name');
            expect(wishList).toHaveProperty('position');
            expect(wishList).toHaveProperty('tagExtractionScript');
            expect(wishList).toHaveProperty('tagBubbleMapping');
            expect(wishList).toHaveProperty('SourceId');
            expect(wishList.name).toEqual('test');
            expect(wishList.position).toEqual('test');
            expect(wishList.tagExtractionScript).toEqual('test');
            expect(wishList.tagBubbleMapping).toEqual({ test: 'tost' });
            expect(wishList.SourceId).toEqual(
                '5fa2d83a-5c5f-4c9b-9759-7f08415791f1',
            );
        });

        it('throws an error when it does not exist', async () => {
            mockWishListRepository.findByPk = jest.fn(async () => {
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
        it('updates a wishList from valid data', async () => {
            const payload = {
                name: 'test2',
            };
            const mockUpdate = jest.fn((payload) => {
                return payload;
            });
            mockWishListRepository.findByPk = jest.fn(async () => {
                return {
                    name: 'test',
                    async update(payload) {
                        mockUpdate(payload);
                        this.name = payload.name;
                    },
                };
            });
            const wishList = await service.update('', payload);
            expect(mockUpdate).toHaveBeenCalledWith(payload);
            expect(wishList).toMatchObject(payload);
        });

        it('throws an error when it does not exist', async () => {
            mockWishListRepository.findByPk = jest.fn(async () => {
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
        it('deletes a wishList', async () => {
            const observer = { isFinished: false };
            const mockDestroy = jest.fn(() =>
                toggleFlagTimeout(observer, 'isFinished', 200),
            );
            mockWishListRepository.findByPk = jest.fn(async () => ({
                destroy: mockDestroy,
            }));
            await service.remove('');
            expect(observer.isFinished).toBe(true);
        });

        it('throws an error when it does not exist', async () => {
            mockWishListRepository.findByPk = jest.fn(async () => {
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
