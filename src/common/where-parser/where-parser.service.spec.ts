import { BadRequestException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Op } from 'sequelize';
import { WhereParserService } from './where-parser.service';

describe('WhereParserService', () => {
    let service: WhereParserService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [WhereParserService],
        }).compile();

        service = module.get<WhereParserService>(WhereParserService);
    });

    it('is defined', () => {
        expect(service).toBeDefined();
    });

    describe('parseQuery()', () => {
        describe('simple values', () => {
            it.each([
                ['string', 'string'],
                ['  string ', 'string'],
                ['  str ing ', 'str ing'],
                ['10number', '10number'],
                ['10', 10],
                [' 10   ', 10],
                ['0010', 10],
                ['0010.5', 10.5],
                ['10,5', '10,5'],
                ['10..5', '10..5'],
                ['"10"', '10'],
                ['10-0', '10-0'],
                ['null', null],
                ['"not:0"', 'not:0'],
            ])("correctly parses '%s' as %o", (query, result) => {
                const res = service.parseQuery(query);
                expect(res).toEqual(result);
            });
        });

        describe('unary operators', () => {
            it.each([
                ['lt:10', { [Op.lt]: 10 }],
                ['gt:2020-01-02T12:12:12', { [Op.gt]: '2020-01-02T12:12:12' }],
                ['not:string', { [Op.ne]: 'string' }],
                ['not:null', { [Op.ne]: null }],
                ['regex:(.*)[a|b]+', { [Op.iRegexp]: '(.*)[a|b]+' }],
            ])("correctly parses '%s'", (query, result) => {
                const res = service.parseQuery(query);
                expect(res).toEqual(result);
            });

            it.each([['op:what'], ['this::that']])(
                "leaves '%s' as is",
                (query) => {
                    const res = service.parseQuery(query);
                    expect(res).toEqual(query);
                },
            );
        });

        describe('array operators', () => {
            it.each([
                ['or:[a]', { [Op.or]: ['a'] }],
                ['or:[a,b]', { [Op.or]: ['a', 'b'] }],
                ['or:[10,20,30]', { [Op.or]: [10, 20, 30] }],
                ['and:[10,test]', { [Op.and]: [10, 'test'] }],
            ])("correctly parses '%s'", (query, result) => {
                const res = service.parseQuery(query);
                expect(res).toEqual(result);
            });

            it.each([['or:a'], ['or:[a,b'], ['or:10,20,30]'], ['and:[]']])(
                "throws SyntaxError for '%s'",
                (query) => {
                    expect(() => service.parseQuery(query)).toThrowError(
                        SyntaxError,
                    );
                },
            );

            it.each([
                [
                    'and: [gt:10, lt:20]',
                    { [Op.and]: [{ [Op.gt]: 10 }, { [Op.lt]: 20 }] },
                ],
                [
                    'or: [null, regex:^a.*b$]',
                    { [Op.or]: [null, { [Op.iRegexp]: '^a.*b$' }] },
                ],
                [
                    'or:[not:null, and:[gt:10, lt:20]]',
                    {
                        [Op.or]: [
                            { [Op.ne]: null },
                            { [Op.and]: [{ [Op.gt]: 10 }, { [Op.lt]: 20 }] },
                        ],
                    },
                ],
            ])("correctly parses '%s'", (query, result) => {
                const res = service.parseQuery(query);
                expect(res).toEqual(result);
            });
        });
    });

    describe('parseWhereObject()', () => {
        const queryObj = {
            color: 'red',
            number: 'or:[not:null, and:[gt:10, lt:20]]',
            name: 'regex:^te.*st$',
        };
        const resultObj = {
            color: 'red',
            number: {
                [Op.or]: [
                    { [Op.ne]: null },
                    { [Op.and]: [{ [Op.gt]: 10 }, { [Op.lt]: 20 }] },
                ],
            },
            name: { [Op.iRegexp]: '^te.*st$' },
        };

        it('parses correctly whole object', () => {
            const res = service.parseWhereObject(queryObj);
            expect(res).toEqual(resultObj);
        });

        it('returns only whitelisted items', () => {
            const res = service.parseWhereObject(queryObj, ['number', 'name']);
            expect(res).toEqual({
                number: resultObj.number,
                name: resultObj.name,
            });
        });

        it('returns and renames only whitelisted items', () => {
            const res = service.parseWhereObject(queryObj, [
                ['num', 'number'],
                ['colour', 'color'],
            ]);
            expect(res).toEqual({
                num: resultObj.number,
                colour: resultObj.color,
            });
        });

        it('throws BadRequestException if input is malformed', () => {
            const badQueryObj = {
                ...queryObj,
                wrong: 'and:[]',
            };
            expect(() => service.parseWhereObject(badQueryObj)).toThrowError(
                BadRequestException,
            );
        });
    });
});
