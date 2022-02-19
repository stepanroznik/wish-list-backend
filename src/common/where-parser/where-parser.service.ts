import { Injectable } from '@nestjs/common';
import { BadRequestException } from '@nestjs/common';
import { Op } from 'sequelize';

@Injectable()
export class WhereParserService {
    private splitQuery = (query: string) => {
        const q = query.match(/\[(.*)\]/)[1] || query;
        let start = 0;
        let depth = 0;
        const tokens = [];
        for (let i = 0; i < q.length; i++) {
            const element = q[i];
            if (element === '[') depth++;
            else if (element === ']') depth--;
            else if (element === ',' && depth == 0) {
                const token = q.substring(start, i);
                tokens.push(token);
                start = i + 1;
            }
        }
        const token = q.substring(start);
        tokens.push(token);
        return tokens;
    };

    private mapSingleParam = (query: string, seqOp: any) => {
        query = query.substr(query.indexOf(':') + 1);
        return {
            [seqOp]: this.parseQuery(query),
        };
    };

    private mapArrayParam = (query: string, seqOp: any) => {
        try {
            const q = this.splitQuery(query);
            return {
                [seqOp]: [...q.map(this.parseQuery)],
            };
        } catch (e) {
            throw new SyntaxError(`Malformed query near ${query}`);
        }
    };

    /**
     * Creates a query, that is pluggable into a sequelize where query property
     *
     * @param query the query string containing any of the following:
     * - `literal`
     * - `number` - a literal number, e.g  `42` or `3.14`
     * - `string` - a literal string in the form of `text` or delimited with quotes as `'123'` as to not to be parsed as a number
     * - `date` - a literal ISO 8601 date string, e.g `2012-12-12T12:12`, while the `T` can be replaced with a space and anything after the year can be omitted altogether.
     * - `unaryOperator:literal` - supported unary operators:
     *  -- `gt` - greater than, e.g. `gt:30`
     *  -- `lt` - less than, e.g. `lt:2012-12-12`
     *  -- `not` - not equal to, e.g. `not:null`
     *  -- `regex` - match regular expression, e.g. `regex:^jo(e|hn)`
     * - `arrayOperator:[query,query,...]` - supported array operators:
     *  -- `and` - match all of the queries, e.g. `and:[gt:30, lt:42]`
     *  -- `or` - match any of the queries, e.g. `or:[john, joe, jim]`
     *
     * Array operators also support nesting, such as `or:[and:[gt:30,lt:45],gt:50]`
     *
     * @returns parsed sequelize-ready where query
     *
     * @example
     * parseQuery('gt:10') // returns { [Op.gt]: 10 }
     *
     */
    parseQuery = (query: string): any => {
        query = query.trim();

        if (query.startsWith('gt:')) {
            return this.mapSingleParam(query, Op.gt);
        } else if (query.startsWith('lt:')) {
            return this.mapSingleParam(query, Op.lt);
        } else if (query.startsWith('not:')) {
            return this.mapSingleParam(query, Op.ne);
        } else if (query.startsWith('regex:')) {
            return this.mapSingleParam(query, Op.iRegexp);
        } else if (query.startsWith('or:')) {
            return this.mapArrayParam(query, Op.or);
        } else if (query.startsWith('and:')) {
            return this.mapArrayParam(query, Op.and);
        } else {
            const strRegex = query.match(/^["'](.*)["']$/);
            if (strRegex) return strRegex[1];
            if (query == 'null') return null;
            if (/^\d+$/.test(query)) return Number.parseInt(query);
            if (/^\d+\.\d+$/.test(query)) return Number.parseFloat(query);
            return query;
        }
    };

    /**
     * Creates a 'where' object that can be plugged right into sequelize
     *
     * @param query object where keys are fields and values are 'where queries'
     * @param filter if given, the resulting object will contain only those fields.
     * If a value is given as tuple ['newName', 'oldName'], the property 'newName'
     * in the returned object will contain a parsed query from the 'oldName' property
     * in the supplied object.
     * @returns parsed sequelize-ready where object
     *
     * @example
     * parseWhereObject({
     *    number: 'and:[gt:10,lt:20]'
     *    name: 'test'
     * }, ['num', 'number'])
     * ;// returns { num: { [Op.and] : [ ... ] }}
     */
    parseWhereObject = (
        query: Record<string, string>,
        filter: string[] | [string, string][] = null,
    ): Record<string, any> => {
        let q = {};

        try {
            Object.entries(query).forEach(([key, value]) => {
                q[key] = this.parseQuery(value);
            });
        } catch (e) {
            e.message = "the 'where' query is malformed";
            throw new BadRequestException(e.message);
        }

        if (filter) {
            const filteredQ = {};
            for (const key of filter) {
                if (Array.isArray(key)) {
                    if (q[key[0]] || q[key[1]]) {
                        filteredQ[key[0]] = q[key[0]] ?? q[key[1]];
                    }
                } else if (q[key]) {
                    filteredQ[key] = q[key];
                }
            }
            q = filteredQ;
        }
        return q;
    };
}
