import { Injectable } from '@nestjs/common';
import { BaseMapper } from '../common/base/base.mapper';
import { CreateWishListDto } from './dto/create-wish-list.dto';
import { UpdateWishListDto } from './dto/update-wish-list.dto';
import { ViewWishListDto } from './dto/view-wish-list.dto';
import {
    WishList,
    IWishListAttributes,
    IWishListCreationAttributes,
} from './entities/wish-list.entity';

@Injectable()
export class WishListMapper extends BaseMapper<
    CreateWishListDto,
    UpdateWishListDto,
    ViewWishListDto,
    IWishListCreationAttributes,
    IWishListAttributes,
    WishList
> {
    fromDto(dto: CreateWishListDto): IWishListCreationAttributes;
    fromDto(dto: UpdateWishListDto): Partial<IWishListAttributes>;
    fromDto(dto: CreateWishListDto | UpdateWishListDto) {
        return dto;
    }
    toDto(inst: WishList): ViewWishListDto {
        const ret = {
            ...(inst.toJSON() as IWishListAttributes),
        };
        return ret;
    }
}
