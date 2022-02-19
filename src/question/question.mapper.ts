import { Injectable } from '@nestjs/common';
import { BaseMapper } from '../common/base/base.mapper';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { ViewQuestionDto } from './dto/view-question.dto';
import {
    Question,
    IQuestionAttributes,
    IQuestionCreationAttributes,
} from './entities/question.entity';

@Injectable()
export class QuestionMapper extends BaseMapper<
    CreateQuestionDto,
    UpdateQuestionDto,
    ViewQuestionDto,
    IQuestionCreationAttributes,
    IQuestionAttributes,
    Question
> {
    fromDto(dto: CreateQuestionDto): IQuestionCreationAttributes;
    fromDto(dto: UpdateQuestionDto): Partial<IQuestionAttributes>;
    fromDto(dto: CreateQuestionDto | UpdateQuestionDto) {
        return dto;
    }
    toDto(inst: Question): ViewQuestionDto {
        const ret = {
            ...(inst.toJSON() as IQuestionAttributes),
        };
        return ret;
    }
}
