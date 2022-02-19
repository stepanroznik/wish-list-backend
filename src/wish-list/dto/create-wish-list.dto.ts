//import { IWishListCreationAttributes } from '../entities/wish-list.entity';
import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateWishListDto {
    @ApiProperty({
        description: 'Name of the wishList',
    })
    @IsString()
    name: string;
}
