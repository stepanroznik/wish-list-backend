import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';
import { dateTimeProperty } from '../openapi/properties.openapi';

export class TimestampsDto {
    @ApiProperty(dateTimeProperty)
    @IsDateString()
    createdAt: string;

    @ApiProperty(dateTimeProperty)
    @IsDateString()
    updatedAt: string;

    @ApiProperty(dateTimeProperty)
    @IsOptional()
    @IsDateString()
    deletedAt?: string | null;
}
