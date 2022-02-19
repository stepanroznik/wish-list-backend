import { Module } from '@nestjs/common';
import { WhereParserService } from './where-parser.service';

@Module({
    providers: [WhereParserService],
    exports: [WhereParserService],
})
export class WhereParserModule {}
