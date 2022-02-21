import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString, IsUUID } from 'class-validator';
import { TimestampsDto } from '../../common/dto/timestamps.dto';
import { uuidProperty } from '../../common/openapi/properties.openapi';

export class ViewQuestionDto extends TimestampsDto {
    @ApiProperty(uuidProperty)
    @IsUUID()
    id: string;

    @IsString()
    title: string;

    @IsString()
    subtitle: string;

    @IsString()
    position: string;

    @IsBoolean()
    isPrimary: boolean;
}
