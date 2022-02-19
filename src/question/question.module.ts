import { Module } from '@nestjs/common';
import { QuestionService } from './question.service';
import { QuestionController } from './question.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { Question } from './entities/question.entity';
import { QuestionMapper } from './question.mapper';
import { WhereParserModule } from '../common/where-parser/where-parser.module';

@Module({
    imports: [SequelizeModule.forFeature([Question]), WhereParserModule],
    exports: [QuestionMapper],
    controllers: [QuestionController],
    providers: [QuestionService, QuestionMapper],
})
export class QuestionModule {}
