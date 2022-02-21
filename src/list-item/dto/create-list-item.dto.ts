//import { IQuestionCreationAttributes } from '../entities/question.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsIn, IsOptional, IsString } from 'class-validator';

const positionEnum = [
    'top-left',
    'top',
    'top-right',
    'left',
    'center',
    'right',
    'bottom-left',
    'bottom',
    'bottom-right',
];

export class CreateQuestionDto {
    @ApiProperty({
        description: 'Title of the question',
    })
    @IsString()
    title: string;

    @ApiProperty({
        description: 'Subtitle/body of the question',
    })
    @IsOptional()
    @IsString()
    subtitle: string;

    @ApiProperty({
        description:
            'The political compass position of the question (in case of a positive answer)',
        enum: positionEnum,
    })
    @IsString()
    @IsIn(positionEnum)
    position: string;

    @ApiProperty({
        description:
            'Whether or not does the question belong to the core (approx. 24) questions of the quiz',
    })
    @IsBoolean()
    isPrimary: boolean;
}
