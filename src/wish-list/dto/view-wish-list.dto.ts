import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID } from 'class-validator';
import { TimestampsDto } from '../../common/dto/timestamps.dto';
import { uuidProperty } from '../../common/openapi/properties.openapi';

export class ViewWishListDto extends TimestampsDto {
    @ApiProperty(uuidProperty)
    @IsUUID()
    id: string;

    @IsString()
    name: string;
}
