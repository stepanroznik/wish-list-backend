import { createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { LoggerService } from '../common/logger/logger.service';
import { WhereParserService } from '../common/where-parser/where-parser.service';
import { WishListController } from './wish-list.controller';
import { WishListMapper } from './wish-list.mapper';
import { WishListService } from './wish-list.service';

describe('WishListController', () => {
    let controller: WishListController;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [WishListController],
            providers: [
                {
                    provide: WishListService,
                    useValue: createMock<WishListService>(),
                },
                {
                    provide: WhereParserService,
                    useValue: createMock<WhereParserService>(),
                },
                {
                    provide: WishListMapper,
                    useValue: createMock<WishListMapper>(),
                },
                {
                    provide: LoggerService,
                    useValue: createMock<LoggerService>(),
                },
            ],
        }).compile();

        controller = module.get<WishListController>(WishListController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });
});
