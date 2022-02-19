import { PartialType } from '@nestjs/swagger';
import { CreateWishListDto } from './create-wish-list.dto';

export class UpdateWishListDto extends PartialType(CreateWishListDto) {}
